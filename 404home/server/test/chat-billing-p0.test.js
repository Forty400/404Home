/**
 * Chat billing P0 — maps to docs/spdd/4-测试条例/404home-deepseek-chat-cases.md
 * TC-01, TC-02, TC-03, TC-06
 */
const { describe, it, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const {
  setupTestEnv,
  cleanupDb,
  startServer,
  enableDeepseekStub,
  disableDeepseekUpstream,
  setUserBalanceCents,
  ledgerByUser
} = require('./helpers')

const dbFile = setupTestEnv()
disableDeepseekUpstream()

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

beforeEach(() => {
  disableDeepseekUpstream()
})

async function registerFresh(email) {
  const cap = await api.request('GET', '/api/user/captcha')
  const reg = await api.request('POST', '/api/user/register', {
    body: {
      email,
      password: 'secret12',
      captchaId: cap.data.captchaId,
      captchaCode: cap.data.debugCode
    }
  })
  assert.equal(reg.status, 200)
  return reg.data
}

describe('chat billing P0', () => {
  it('TC-01: stub chat charges balance + ledger reason chat', async () => {
    enableDeepseekStub()
    const email = `ccharge${Date.now()}@example.com`
    const { user, token } = await registerFresh(email)
    const before = user.balance_cents
    const res = await api.request('POST', '/api/chat/completions', {
      token,
      body: { message: 'ping stub' }
    })
    assert.equal(res.status, 200)
    assert.ok(res.data.message?.content)
    assert.ok(res.data.charged_cents >= 1)
    assert.ok(res.data.user.balance_cents < before)
    assert.equal(res.data.user.balance_cents, before - res.data.charged_cents)
    const chatLedger = ledgerByUser(user.id, 'chat')
    assert.ok(chatLedger.length >= 1)
    assert.ok(chatLedger.some((r) => r.delta_cents < 0))
  })

  it('TC-02: zero balance → INSUFFICIENT_BALANCE', async () => {
    enableDeepseekStub()
    const email = `czero${Date.now()}@example.com`
    const { user, token } = await registerFresh(email)
    setUserBalanceCents(user.id, 0)
    const res = await api.request('POST', '/api/chat/completions', {
      token,
      body: { message: 'should fail' }
    })
    assert.equal(res.status, 402)
    assert.equal(res.data.code, 'INSUFFICIENT_BALANCE')
    const row = db.prepare('SELECT balance_cents FROM users WHERE id = ?').get(user.id)
    assert.equal(row.balance_cents, 0)
  })

  it('TC-03: no key and no stub → DEEPSEEK_NOT_CONFIGURED', async () => {
    disableDeepseekUpstream()
    const email = `cnokey${Date.now()}@example.com`
    const { token } = await registerFresh(email)
    const res = await api.request('POST', '/api/chat/completions', {
      token,
      body: { message: 'no key' }
    })
    assert.equal(res.status, 503)
    assert.equal(res.data.code, 'DEEPSEEK_NOT_CONFIGURED')
  })

  it('TC-06: unauthenticated completions → 401', async () => {
    enableDeepseekStub()
    const res = await api.request('POST', '/api/chat/completions', {
      body: { message: 'anon' }
    })
    assert.equal(res.status, 401)
  })
})
