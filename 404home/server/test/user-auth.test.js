/**
 * Auth P0 API — maps to docs/spdd/4-测试条例/404home-auth-cases.md
 * TC-01, TC-02 (token), TC-03, TC-09
 */
const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const jwt = require('jsonwebtoken')
const { setupTestEnv, cleanupDb, startServer } = require('./helpers')

const dbFile = setupTestEnv()

const { seed } = require('../seed')
const { createApp } = require('../app')

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

async function registerFresh(email) {
  const cap = await api.request('GET', '/api/user/captcha')
  assert.equal(cap.status, 200)
  assert.ok(cap.data.debugCode, 'CAPTCHA_DEBUG should expose debugCode')
  const reg = await api.request('POST', '/api/user/register', {
    body: {
      email,
      password: 'secret12',
      captchaId: cap.data.captchaId,
      captchaCode: cap.data.debugCode
    }
  })
  return reg
}

describe('user auth P0', () => {
  it('TC-01: register with captcha grants 300 cents + JWT role user', async () => {
    const email = `u${Date.now()}@example.com`
    const reg = await registerFresh(email)
    assert.equal(reg.status, 200)
    assert.ok(reg.data.token)
    assert.equal(reg.data.user.balance_cents, 300)
    assert.equal(reg.data.user.balance_cap_cents, 300)
    const payload = jwt.verify(reg.data.token, process.env.JWT_SECRET)
    assert.equal(payload.role, 'user')
    assert.equal(payload.email, email)
  })

  it('TC-03: bad captcha rejects register', async () => {
    const cap = await api.request('GET', '/api/user/captcha')
    const reg = await api.request('POST', '/api/user/register', {
      body: {
        email: `bad${Date.now()}@example.com`,
        password: 'secret12',
        captchaId: cap.data.captchaId,
        captchaCode: 'XXXX'
      }
    })
    assert.equal(reg.status, 400)
    assert.equal(reg.data.code, 'CAPTCHA_INVALID')
  })

  it('TC-02: login returns user JWT; /me works', async () => {
    const email = `login${Date.now()}@example.com`
    await registerFresh(email)
    const login = await api.request('POST', '/api/user/login', {
      body: { email, password: 'secret12' }
    })
    assert.equal(login.status, 200)
    assert.ok(login.data.token)
    const me = await api.request('GET', '/api/user/me', { token: login.data.token })
    assert.equal(me.status, 200)
    assert.equal(me.data.user.email, email)
  })

  it('TC-09: admin JWT cannot call /api/user/me', async () => {
    const adminToken = jwt.sign(
      { id: 1, username: 'admin', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    const me = await api.request('GET', '/api/user/me', { token: adminToken })
    assert.equal(me.status, 403)
    assert.equal(me.data.code, 'FORBIDDEN')
  })

  it('unauthenticated /me → 401', async () => {
    const me = await api.request('GET', '/api/user/me')
    assert.equal(me.status, 401)
  })
})
