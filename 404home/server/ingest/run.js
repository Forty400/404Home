/**
 * Silent ingest runner — read-only fetch of public feeds/GitHub, POST to local API.
 * Usage: node ingest/run.js [--dry-run]
 * Never comments / issues / PRs / stars on source platforms.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const fs = require('fs')
const path = require('path')
const { assembleNewsDraft, assembleGithubDraft } = require('./assemble')
const { getControl, setStatus } = require('./control')

const dryRun = process.argv.includes('--dry-run')
const root = path.join(__dirname)
const configPath =
  process.env.INGEST_CONFIG ||
  (fs.existsSync(path.join(root, 'config.json'))
    ? path.join(root, 'config.json')
    : path.join(root, 'config.example.json'))

function loadConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'))
}

async function fetchText(url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/rss+xml, application/json, text/plain, */*' }
  })
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
  return res.text()
}

/** Minimal RSS item scrape: title + link + description. */
function parseRssItems(xml, limit = 5) {
  const items = []
  const blocks = String(xml).split(/<item[\s>]/i).slice(1)
  for (const b of blocks) {
    if (items.length >= limit) break
    const title = (b.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i) || [])[1]
    const link = (b.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) || [])[1]
    const desc = (b.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) || [])[1]
    if (!title || !link) continue
    items.push({
      title: title.replace(/<[^>]+>/g, '').trim(),
      link: link.replace(/<[^>]+>/g, '').trim(),
      summary: (desc || '').replace(/<[^>]+>/g, '').trim().slice(0, 500)
    })
  }
  return items
}

async function postIngest(apiBase, jwtToken, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (jwtToken) headers.Authorization = `Bearer ${jwtToken}`
  const ingestToken = process.env.INGEST_TOKEN
  if (ingestToken) headers['X-Ingest-Token'] = ingestToken
  const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

/** Prefer static INGEST_TOKEN; else login with ADMIN_* each run (no stale JWT). */
async function resolveAuth(apiBase) {
  if (process.env.INGEST_TOKEN) {
    console.log('[ingest] auth=INGEST_TOKEN')
    return ''
  }
  const user = process.env.ADMIN_USERNAME
  const pass = process.env.ADMIN_PASSWORD
  if (user && pass) {
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.token) {
      throw new Error(`admin login failed: ${res.status} ${JSON.stringify(data)}`)
    }
    console.log('[ingest] auth=admin_login')
    return data.token
  }
  if (process.env.INGEST_ADMIN_JWT) {
    console.log('[ingest] auth=INGEST_ADMIN_JWT (legacy)')
    return process.env.INGEST_ADMIN_JWT
  }
  throw new Error('set INGEST_TOKEN or ADMIN_USERNAME/PASSWORD')
}

async function main() {
  const control = getControl()
  if (!dryRun && !control.enabled && process.env.INGEST_FORCE !== '1') {
    console.log('[ingest] skip: disabled')
    setStatus({
      running: false,
      phase: 'disabled',
      message: 'ingest disabled',
      lastFinishedAt: new Date().toISOString()
    })
    return
  }

  const cfg = loadConfig()
  const dailyLimit = Number(cfg.dailyLimit) || 5
  const newsCap = Math.min(Number(cfg.newsLimit ?? cfg.newsMaxPerDay) || 3, dailyLimit)
  const githubCap = Math.min(Number(cfg.githubLimit ?? cfg.githubMaxPerDay) || 2, dailyLimit)
  const apiBase = process.env.INGEST_API_BASE || 'http://127.0.0.1:3001'
  let posted = 0
  let newsPosted = 0
  let githubPosted = 0
  const totalPlan = newsCap + githubCap

  console.log(
    `[ingest] config=${configPath} dryRun=${dryRun} dailyLimit=${dailyLimit} newsCap=${newsCap} githubCap=${githubCap}`
  )

  if (!dryRun) {
    setStatus({
      running: true,
      phase: 'auth',
      current: 0,
      total: totalPlan,
      message: 'resolving auth',
      lastError: '',
      lastStartedAt: new Date().toISOString()
    })
  }

  const token = dryRun ? '' : await resolveAuth(apiBase)
  if (!dryRun) setStatus({ phase: 'news', message: 'fetching news' })

  for (const feed of cfg.newsFeeds || []) {
    if (posted >= dailyLimit || newsPosted >= newsCap) break
    try {
      if (dryRun) {
        console.log(`[ingest] dry-run would fetch news feed ${feed.url}`)
        continue
      }
      if (!/^https?:\/\//i.test(feed.url) || feed.url.includes('example.com')) {
        console.log(`[ingest] skip placeholder feed ${feed.url}`)
        continue
      }
      const xml = await fetchText(feed.url)
      const items = parseRssItems(xml, Math.min(newsCap - newsPosted, dailyLimit - posted))
      for (const item of items) {
        if (posted >= dailyLimit || newsPosted >= newsCap) break
        const draft = assembleNewsDraft({
          title: item.title,
          summary: item.summary,
          body: item.summary,
          sourceName: feed.name,
          sourceUrl: item.link
        })
        const res = await postIngest(apiBase, token, draft)
        if (res.status === 429 && res.data.code === 'pending_backlog_full') {
          console.log(`[ingest] skip ingest: pending_backlog_full`)
          return
        }
        if (res.status === 409) {
          console.log(`[ingest] dup ${item.link}`)
          continue
        }
        if (res.status >= 200 && res.status < 300) {
          posted += 1
          newsPosted += 1
          if (!dryRun) {
            setStatus({
              phase: 'news',
              current: posted,
              total: totalPlan,
              message: `news ${item.title}`.slice(0, 120)
            })
          }
          console.log(`[ingest] news ok ${res.data.id} ${item.title}`)
        } else {
          console.log(`[ingest] news fail ${res.status}`, res.data)
        }
      }
    } catch (e) {
      console.log(`[ingest] news error ${feed.url}:`, e.message)
    }
  }

  if (!dryRun) setStatus({ phase: 'github', message: 'fetching github' })

  for (const gq of cfg.githubQueries || []) {
    if (posted >= dailyLimit || githubPosted >= githubCap) break
    try {
      if (dryRun) {
        console.log(`[ingest] dry-run would GET api.github.com/search/repositories q=${gq.q}`)
        continue
      }
      const q = encodeURIComponent(gq.q)
      const perPage = Math.min(Number(gq.perPage) || 5, githubCap - githubPosted, dailyLimit - posted)
      // GET only — never star/fork/comment
      const url = `https://api.github.com/search/repositories?q=${q}&per_page=${perPage}`
      const headers = { Accept: 'application/vnd.github+json', 'User-Agent': '404home-silent-ingest' }
      if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
      const res = await fetch(url, { method: 'GET', headers })
      if (!res.ok) {
        console.log(`[ingest] github search ${res.status}`)
        continue
      }
      const json = await res.json()
      for (const repo of json.items || []) {
        if (posted >= dailyLimit || githubPosted >= githubCap) break
        let readme = ''
        try {
          const raw = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch || 'main'}/README.md`
          const r = await fetch(raw, { method: 'GET', headers: { 'User-Agent': '404home-silent-ingest' } })
          if (r.ok) readme = (await r.text()).slice(0, 4000)
        } catch {
          /* optional */
        }
        const draft = assembleGithubDraft({
          fullName: repo.full_name,
          description: repo.description || '',
          readmeExcerpt: readme,
          htmlUrl: repo.html_url
        })
        const postedRes = await postIngest(apiBase, token, draft)
        if (postedRes.status === 429 && postedRes.data.code === 'pending_backlog_full') {
          console.log(`[ingest] skip ingest: pending_backlog_full`)
          return
        }
        if (postedRes.status === 409) continue
        if (postedRes.status >= 200 && postedRes.status < 300) {
          posted += 1
          githubPosted += 1
          if (!dryRun) {
            setStatus({
              phase: 'github',
              current: posted,
              total: totalPlan,
              message: `github ${repo.full_name}`.slice(0, 120)
            })
          }
          console.log(`[ingest] github ok ${postedRes.data.id} ${repo.full_name}`)
        }
      }
    } catch (e) {
      console.log(`[ingest] github error:`, e.message)
    }
  }

  console.log(`[ingest] done posted=${posted} news=${newsPosted} github=${githubPosted}`)
  if (!dryRun) {
    setStatus({
      running: false,
      phase: 'done',
      current: posted,
      total: totalPlan,
      message: 'finished',
      lastPosted: posted,
      lastNews: newsPosted,
      lastGithub: githubPosted,
      lastFinishedAt: new Date().toISOString()
    })
  }
}

main().catch((e) => {
  console.error(e)
  try {
    setStatus({
      running: false,
      phase: 'error',
      message: 'failed',
      lastError: String(e && e.message ? e.message : e).slice(0, 500),
      lastFinishedAt: new Date().toISOString()
    })
  } catch {
    /* ignore */
  }
  process.exit(1)
})
