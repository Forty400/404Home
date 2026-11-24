/**
 * Silent ingest runner — read-only fetch of public feeds/GitHub, POST to local API.
 * Usage: node ingest/run.js [--dry-run]
 * Never comments / issues / PRs / stars on source platforms.
 */
const fs = require('fs')
const path = require('path')
const { assembleNewsDraft, assembleGithubDraft } = require('./assemble')

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

async function postIngest(apiBase, token, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
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

async function main() {
  const cfg = loadConfig()
  const dailyLimit = Number(cfg.dailyLimit) || 5
  const apiBase = process.env.INGEST_API_BASE || 'http://127.0.0.1:3001'
  const token = process.env.INGEST_ADMIN_JWT || ''
  let posted = 0

  console.log(`[ingest] config=${configPath} dryRun=${dryRun} dailyLimit=${dailyLimit}`)

  for (const feed of cfg.newsFeeds || []) {
    if (posted >= dailyLimit) break
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
      const items = parseRssItems(xml, dailyLimit - posted)
      for (const item of items) {
        if (posted >= dailyLimit) break
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
          console.log(`[ingest] news ok ${res.data.id} ${item.title}`)
        } else {
          console.log(`[ingest] news fail ${res.status}`, res.data)
        }
      }
    } catch (e) {
      console.log(`[ingest] news error ${feed.url}:`, e.message)
    }
  }

  for (const gq of cfg.githubQueries || []) {
    if (posted >= dailyLimit) break
    try {
      if (dryRun) {
        console.log(`[ingest] dry-run would GET api.github.com/search/repositories q=${gq.q}`)
        continue
      }
      const q = encodeURIComponent(gq.q)
      const perPage = Math.min(Number(gq.perPage) || 5, dailyLimit - posted)
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
        if (posted >= dailyLimit) break
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
          console.log(`[ingest] github ok ${postedRes.data.id} ${repo.full_name}`)
        }
      }
    } catch (e) {
      console.log(`[ingest] github error:`, e.message)
    }
  }

  console.log(`[ingest] done posted=${posted}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
