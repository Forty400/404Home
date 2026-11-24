/**
 * Chat SSE stream P0 — maps to docs/spdd/4-测试条例/404home-deepseek-chat-cases.md
 * TC-07…TC-11 → TC-S01…TC-S05 (HANDOFF §4.7)
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

describe('chat stream P0', () => {
  it('TC-S01: stub stream yields delta+done, charges balance + ledger chat', async () => {
    enableDeepseekStub()
    const email = `sstream${Date.now()}@example.com`
    const { user, token } = await registerFresh(email)
    const before = user.balance_cents
    const res = await api.requestStream('POST', '/api/chat/completions/stream', {
      token,
      body: { message: 'ping stream stub' }
    })
    assert.equal(res.status, 200)
    const deltas = res.events.filter((e) => e.type === 'delta')
    const dones = res.events.filter((e) => e.type === 'done')
    assert.ok(deltas.length >= 1, 'expected ≥1 delta')
    assert.equal(dones.length, 1)
    const done = dones[0]
    assert.ok(done.message?.id)
    assert.ok(done.message?.content)
    assert.ok(done.charged_cents >= 1)
    assert.ok(done.user.balance_cents < before)
    assert.equal(done.user.balance_cents, before - done.charged_cents)
    const chatLedger = ledgerByUser(user.id, 'chat')
    assert.ok(chatLedger.length >= 1)
    assert.ok(chatLedger.some((r) => r.delta_cents < 0))
  })

  it('TC-S02: zero balance → INSUFFICIENT_BALANCE before stream', async () => {
    enableDeepseekStub()
    const email = `szero${Date.now()}@example.com`
    const { user, token } = await registerFresh(email)
    setUserBalanceCents(user.id, 0)
    const res = await api.requestStream('POST', '/api/chat/completions/stream', {
      token,
      body: { message: 'should fail' }
    })
    assert.equal(res.status, 402)
    assert.equal(res.data.code, 'INSUFFICIENT_BALANCE')
    const row = db.prepare('SELECT balance_cents FROM users WHERE id = ?').get(user.id)
    assert.equal(row.balance_cents, 0)
  })

  it('TC-S03: no key and no stub → DEEPSEEK_NOT_CONFIGURED', async () => {
    disableDeepseekUpstream()
    const email = `snokey${Date.now()}@example.com`
    const { token } = await registerFresh(email)
    const res = await api.requestStream('POST', '/api/chat/completions/stream', {
      token,
      body: { message: 'no key' }
    })
    assert.equal(res.status, 503)
    assert.equal(res.data.code, 'DEEPSEEK_NOT_CONFIGURED')
  })

  it('TC-S04: unauthenticated stream → 401', async () => {
    enableDeepseekStub()
    const res = await api.requestStream('POST', '/api/chat/completions/stream', {
      body: { message: 'anon' }
    })
    assert.equal(res.status, 401)
  })

  it('TC-S05: non-stream completions still charges (regression)', async () => {
    enableDeepseekStub()
    const email = `sreg${Date.now()}@example.com`
    const { user, token } = await registerFresh(email)
    const before = user.balance_cents
    const res = await api.request('POST', '/api/chat/completions', {
      token,
      body: { message: 'ping non-stream' }
    })
    assert.equal(res.status, 200)
    assert.ok(res.data.charged_cents >= 1)
    assert.ok(res.data.user.balance_cents < before)
    const chatLedger = ledgerByUser(user.id, 'chat')
    assert.ok(chatLedger.length >= 1)
  })
})
