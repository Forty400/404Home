/**
 * Site analytics P0 — docs/spdd/4-测试条例/404home-site-analytics-cases.md
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

async function adminToken() {
  const login = await api.request('POST', '/api/auth/login', {
    body: { username: 'admin', password: 'admin123' }
  })
  assert.equal(login.status, 200)
  return login.data.token
}

describe('analytics P0', () => {
  it('TC-01: pageview records a row', async () => {
    const before = db.prepare('SELECT COUNT(*) AS c FROM page_views').get().c
    const res = await api.request('POST', '/api/analytics/pageview', {
      body: { path: '/news', visitorId: 'v-test-1' }
    })
    assert.equal(res.status, 200)
    assert.equal(res.data.ok, true)
    const after = db.prepare('SELECT COUNT(*) AS c FROM page_views').get().c
    assert.equal(after, before + 1)
  })

  it('TC-02: traffic aggregates pv/uv and top paths', async () => {
    db.prepare('DELETE FROM page_views').run()
    const ins = db.prepare(
      `INSERT INTO page_views (path, visitor_id, created_at) VALUES (?, ?, datetime('now'))`
    )
    ins.run('/', 'a')
    ins.run('/', 'a')
    ins.run('/tool/x', 'b')
    ins.run('/news', 'c')

    const token = await adminToken()
    const res = await api.request('GET', '/api/stats/traffic', { token })
    assert.equal(res.status, 200)
    assert.ok(res.data.today.pv >= 4)
    assert.ok(res.data.today.uv >= 3)
    assert.ok(res.data.days7.pv >= 4)
    assert.ok(Array.isArray(res.data.daily))
    assert.ok(res.data.daily.length >= 1)
    assert.ok(Array.isArray(res.data.topPaths))
    assert.equal(res.data.topPaths[0].path, '/')
    assert.ok(res.data.topPaths[0].pv >= 2)
  })

  it('TC-03: traffic requires admin', async () => {
    const anon = await api.request('GET', '/api/stats/traffic')
    assert.ok(anon.status === 401 || anon.status === 403)

    const cap = await api.request('GET', '/api/user/captcha')
    const reg = await api.request('POST', '/api/user/register', {
      body: {
        email: `an${Date.now()}@ex.com`,
        password: 'secret12',
        captchaId: cap.data.captchaId,
        captchaCode: cap.data.debugCode
      }
    })
    const userTok = reg.data.token
    const res = await api.request('GET', '/api/stats/traffic', { token: userTok })
    assert.equal(res.status, 403)
  })

  it('TC-04: reject empty or long path', async () => {
    const empty = await api.request('POST', '/api/analytics/pageview', {
      body: { path: '  ', visitorId: 'v' }
    })
    assert.equal(empty.status, 400)
    const long = await api.request('POST', '/api/analytics/pageview', {
      body: { path: '/' + 'x'.repeat(600), visitorId: 'v' }
    })
    assert.equal(long.status, 400)
  })
})
