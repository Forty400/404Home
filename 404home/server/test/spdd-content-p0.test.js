/**
 * SPDD content series P0 — docs/spdd/4-测试条例/404home-spdd-content-cases.md
 * TC-01 · TC-02
 */
const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { setupTestEnv, cleanupDb, startServer } = require('./helpers')

const dbFile = setupTestEnv()

const { seed } = require('../seed')
const { createApp } = require('../app')
const { db } = require('../db')

seed()
const app = createApp()
let api

const SERIES = ['SPDD 规划指导手册', '仓库 SPDD 化教程']

before(async () => {
  api = await startServer(app)
})

after(async () => {
  if (api) await api.close()
  cleanupDb(dbFile)
})

describe('spdd content P0', () => {
  it('TC-01: seed has SPDD series tutorials with thick body', () => {
    for (const title of SERIES) {
      const row = db
        .prepare(
          `SELECT * FROM posts WHERE published = 1 AND title = ?`
        )
        .get(title)
      assert.ok(row, `missing post: ${title}`)
      assert.equal(row.topic, 'method')
      assert.ok(row.source_url, `${title} needs source_url`)
      assert.ok(
        String(row.content || '').length >= 800,
        `${title} content len=${String(row.content || '').length}`
      )
    }
  })

  it('TC-02: method hot ≤3 and includes a series title', () => {
    const hot = db
      .prepare(
        `SELECT title FROM posts WHERE published = 1 AND is_hot = 1 AND topic = 'method'`
      )
      .all()
    assert.ok(hot.length <= 3, `method hot=${hot.length}`)
    const titles = new Set(hot.map((r) => r.title))
    assert.ok(
      SERIES.some((t) => titles.has(t)),
      `expected one of ${SERIES.join(' / ')} in hot, got ${[...titles].join(', ')}`
    )
  })

  it('TC-05: About.vue mentions content + trial', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '../../src/views/About.vue'),
      'utf8'
    )
    assert.match(src, /文章|内容/)
    assert.match(src, /试用/)
  })
})
