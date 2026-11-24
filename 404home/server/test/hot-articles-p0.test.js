/**
 * Hot articles P0 — docs/spdd/4-测试条例/404home-hot-articles-cases.md
 * TC-01 … TC-05
 */
const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const jwt = require('jsonwebtoken')
const { setupTestEnv, cleanupDb, startServer } = require('./helpers')

const dbFile = setupTestEnv()

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

describe('hot articles P0', () => {
  it('TC-04: seed has ≥20 published posts with cover, topic, source_url, content', () => {
    const rows = db
      .prepare(
        `SELECT * FROM posts WHERE published = 1
         AND cover != '' AND content != '' AND source_url != ''
         AND topic IN ('plugin','dev','method','news')`
      )
      .all()
    assert.ok(rows.length >= 20, `expected ≥20 hot articles, got ${rows.length}`)
    const topics = new Set(rows.map((r) => r.topic))
    for (const t of ['plugin', 'dev', 'method', 'news']) {
      assert.ok(topics.has(t), `missing topic ${t}`)
    }
  })

  it('TC-01: GET /api/posts?topic=plugin filters', async () => {
    const res = await api.request('GET', '/api/posts?topic=plugin')
    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.data))
    assert.ok(res.data.length >= 1)
    for (const p of res.data) {
      assert.equal(p.topic, 'plugin')
      assert.equal(p.published, true)
    }
  })

  it('TC-02: GET /api/posts?hot=1 returns only hot', async () => {
    const res = await api.request('GET', '/api/posts?hot=1')
    assert.equal(res.status, 200)
    assert.ok(res.data.length >= 1)
    for (const p of res.data) {
      assert.equal(p.is_hot, true)
    }
  })

  it('TC-03: GET /api/posts/:id includes body and source', async () => {
    const list = await api.request('GET', '/api/posts?hot=1')
    const id = list.data[0].id
    const res = await api.request('GET', `/api/posts/${id}`)
    assert.equal(res.status, 200)
    assert.ok(res.data.content)
    assert.ok(res.data.source_url)
    assert.ok(res.data.source_name !== undefined)
  })

  it('TC-05: POST rejects illegal topic', async () => {
    const res = await api.request('POST', '/api/posts', {
      token: adminJwt(),
      body: {
        type: 'news',
        title: 'bad topic',
        topic: 'invalid',
        summary: 'x',
        content: 'y',
        source_url: 'https://example.com'
      }
    })
    assert.equal(res.status, 400)
    assert.ok(res.data.error)
  })
})
