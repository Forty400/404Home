/**
 * Article ingest + review P0 —
 * docs/spdd/4-测试条例/404home-article-ingest-review-cases.md TC-01…07
 */
const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const jwt = require('jsonwebtoken')
const { setupTestEnv, cleanupDb, startServer } = require('./helpers')

const dbFile = setupTestEnv()
process.env.PENDING_REVIEW_LIMIT = '3'

const { seed } = require('../seed')
const { createApp } = require('../app')
const { db } = require('../db')

seed()
const app = createApp()
let api

before(async () => {
  api = await startServer(app)
})

after(async () => {
  if (api) await api.close()
  cleanupDb(dbFile)
})

function adminJwt() {
  return jwt.sign(
    { id: 1, username: 'admin', role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
}

function insertPost(overrides = {}) {
  const lifecycle = overrides.lifecycle || 'draft'
  const published = lifecycle === 'published' ? 1 : 0
  const r = db
    .prepare(
      `INSERT INTO posts (type, title, summary, content, cover, topic, source_name, source_url, is_hot, published, lifecycle, ingest_bot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      overrides.type || 'news',
      overrides.title || `t-${Date.now()}-${Math.random()}`,
      overrides.summary || 's',
      overrides.content || 'c',
      overrides.cover || '/covers/hot-01.svg',
      overrides.topic || 'news',
      overrides.source_name || 'src',
      overrides.source_url || `https://example.com/${Date.now()}-${Math.random()}`,
      overrides.is_hot ? 1 : 0,
      published,
      lifecycle,
      overrides.ingest_bot || ''
    )
  return r.lastInsertRowid
}

describe('article ingest review P0', () => {
  it('TC-01: public list only published lifecycle', async () => {
    insertPost({ lifecycle: 'draft', title: 'draft-only' })
    insertPost({ lifecycle: 'pending_review', title: 'pending-only' })
    insertPost({ lifecycle: 'archived', title: 'archived-only' })
    const pubId = insertPost({ lifecycle: 'published', title: 'pub-only' })
    const res = await api.request('GET', '/api/posts')
    assert.equal(res.status, 200)
    assert.ok(res.data.every((p) => p.lifecycle === 'published' && p.published === true))
    assert.ok(res.data.some((p) => p.id === pubId))
    assert.ok(!res.data.some((p) => p.title === 'draft-only'))
    assert.ok(!res.data.some((p) => p.title === 'pending-only'))
    assert.ok(!res.data.some((p) => p.title === 'archived-only'))
  })

  it('TC-02: approve -> draft, still not public', async () => {
    const id = insertPost({ lifecycle: 'pending_review', title: 'to-approve' })
    const res = await api.request('POST', `/api/posts/${id}/approve`, { token: adminJwt() })
    assert.equal(res.status, 200)
    assert.equal(res.data.lifecycle, 'draft')
    assert.equal(res.data.published, false)
    const list = await api.request('GET', '/api/posts')
    assert.ok(!list.data.some((p) => p.id === id))
  })

  it('TC-03: publish -> archive -> restore', async () => {
    const id = insertPost({ lifecycle: 'draft', title: 'cycle' })
    let res = await api.request('POST', `/api/posts/${id}/publish`, { token: adminJwt() })
    assert.equal(res.status, 200)
    assert.equal(res.data.lifecycle, 'published')
    assert.equal(res.data.published, true)

    res = await api.request('POST', `/api/posts/${id}/archive`, { token: adminJwt() })
    assert.equal(res.status, 200)
    assert.equal(res.data.lifecycle, 'archived')
    let list = await api.request('GET', '/api/posts')
    assert.ok(!list.data.some((p) => p.id === id))

    res = await api.request('POST', `/api/posts/${id}/restore`, { token: adminJwt() })
    assert.equal(res.status, 200)
    assert.equal(res.data.lifecycle, 'draft')
  })

  it('TC-04: fork creates draft copy', async () => {
    const id = insertPost({ lifecycle: 'pending_review', title: 'fork-me', content: 'body' })
    const res = await api.request('POST', `/api/posts/${id}/fork`, { token: adminJwt() })
    assert.equal(res.status, 200)
    assert.equal(res.data.lifecycle, 'draft')
    assert.ok(String(res.data.title).includes('副本'))
    assert.notEqual(res.data.id, id)
    const orig = db.prepare('SELECT lifecycle FROM posts WHERE id = ?').get(id)
    assert.equal(orig.lifecycle, 'pending_review')
  })

  it('TC-05: pending backlog gate', async () => {
    db.prepare(`DELETE FROM posts WHERE lifecycle = 'pending_review'`).run()
    for (let i = 0; i < 3; i++) {
      insertPost({
        lifecycle: 'pending_review',
        title: `pending-${i}`,
        source_url: `https://example.com/gate-${i}`
      })
    }
    const res = await api.request('POST', '/api/posts', {
      token: adminJwt(),
      body: {
        type: 'news',
        title: 'overflow',
        summary: 's',
        content: 'c',
        topic: 'news',
        source_url: 'https://example.com/overflow',
        lifecycle: 'pending_review',
        ingest: true
      }
    })
    assert.equal(res.status, 429)
    assert.equal(res.data.code, 'pending_backlog_full')
  })

  it('TC-06: hard delete archived', async () => {
    const id = insertPost({ lifecycle: 'archived', title: 'gone' })
    const res = await api.request('DELETE', `/api/posts/${id}`, { token: adminJwt() })
    assert.equal(res.status, 200)
    const get = await api.request('GET', `/api/posts/${id}`)
    assert.equal(get.status, 404)
  })

  it('TC-07: ingest module has no external write verbs', () => {
    const root = path.join(__dirname, '..', 'ingest')
    assert.ok(fs.existsSync(root), 'ingest/ directory must exist')
    const files = fs.readdirSync(root).filter((f) => f.endsWith('.js'))
    assert.ok(files.length >= 1)
    const banned = /\b(createIssue|createComment|addComment|createPullRequest|\.star\(|addStar|createFork)\b/
    for (const f of files) {
      const src = fs.readFileSync(path.join(root, f), 'utf8')
      assert.ok(!banned.test(src), `${f} must not call source-platform write APIs`)
    }
  })
})
