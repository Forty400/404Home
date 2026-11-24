/**
 * UX Week B/C P0 — docs/spdd/4-测试条例/404home-ux-week-bc-cases.md TC-03…06
 */
const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
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

describe('ux week bc P0', () => {
  it('TC-03: hot articles ≤3 per topic', () => {
    const rows = db
      .prepare(
        `SELECT topic, COUNT(*) AS n FROM posts WHERE published = 1 AND is_hot = 1 GROUP BY topic`
      )
      .all()
    for (const r of rows) {
      assert.ok(r.n <= 3, `topic ${r.topic} hot=${r.n}`)
    }
  })

  it('TC-04: hot tools ≤8', () => {
    const n = db.prepare('SELECT COUNT(*) AS n FROM tools WHERE is_hot = 1').get().n
    assert.ok(n <= 8, `hot tools=${n}`)
  })

  it('TC-05: published article content ≥280 chars', () => {
    const rows = db.prepare('SELECT id, length(content) AS len FROM posts WHERE published = 1').all()
    assert.ok(rows.length >= 1)
    for (const r of rows) {
      assert.ok(r.len >= 280, `post ${r.id} len=${r.len}`)
    }
  })

  it('TC-06: tool decision fields on chatgpt', async () => {
    const res = await api.request('GET', '/api/tools/chatgpt')
    assert.equal(res.status, 200)
    assert.ok(res.data.pricing)
    assert.ok(res.data.region_avail)
    assert.ok(res.data.scenario)
  })
})
