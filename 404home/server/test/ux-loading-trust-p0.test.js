/**
 * UX seed timestamps — docs/spdd/4-测试条例/404home-ux-loading-trust-cases.md TC-05
 */
const { describe, it, after } = require('node:test')
const assert = require('node:assert/strict')
const { setupTestEnv, cleanupDb } = require('./helpers')

const dbFile = setupTestEnv()

const { seed } = require('../seed')
const { db } = require('../db')

seed()

after(() => {
  cleanupDb(dbFile)
})

describe('ux loading trust P0', () => {
  it('TC-05: published posts created_at are not mostly identical', () => {
    const rows = db.prepare('SELECT created_at FROM posts WHERE published = 1').all()
    assert.ok(rows.length >= 8, `expected enough posts, got ${rows.length}`)
    const distinct = new Set(rows.map((r) => r.created_at))
    const minDistinct = Math.min(10, rows.length)
    assert.ok(
      distinct.size >= minDistinct,
      `expected ≥${minDistinct} distinct created_at, got ${distinct.size}`
    )
  })
})
