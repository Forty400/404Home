/**
 * UX Sprint A P0 — docs/spdd/4-测试条例/404home-ux-sprint-a-loops-cases.md TC-03…04
 */
const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { setupTestEnv, cleanupDb, startServer } = require('./helpers')

const dbFile = setupTestEnv()

const { seed, BODY_PAD } = require('../seed')
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

describe('ux sprint a P0', () => {
  it('TC-03: no consecutive BODY_PAD; content ≥280', () => {
    assert.ok(BODY_PAD && BODY_PAD.length > 20)
    const pad = BODY_PAD.trim()
    const duplex = `${pad}\n\n${pad}`
    const rows = db.prepare('SELECT id, content FROM posts WHERE published = 1').all()
    assert.ok(rows.length >= 1)
    for (const r of rows) {
      const content = r.content || ''
      assert.ok(content.length >= 280, `post ${r.id} len=${content.length}`)
      assert.ok(!content.includes(duplex), `post ${r.id} has repeated BODY_PAD`)
    }
  })

  it('TC-04: Trial / balance copy has no 充值', () => {
    const root = path.join(__dirname, '..', '..', 'src')
    const trial = fs.readFileSync(path.join(root, 'views', 'Trial.vue'), 'utf8')
    const chat = fs.readFileSync(path.join(root, 'composables', 'useTrialChat.js'), 'utf8')
    assert.ok(!/充值/.test(trial), 'Trial.vue must not promise 充值')
    assert.ok(!/充值/.test(chat), 'useTrialChat.js must not promise 充值')
  })
})
