/**
 * Wallet P0 — maps to docs/spdd/4-测试条例/404home-wallet-cases.md
 * TC-01, TC-02, TC-03, TC-04
 */
const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const {
  setupTestEnv,
  cleanupDb,
  startServer,
  setUserBalanceCents,
  ledgerByUser,
  disableDeepseekUpstream
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

async function adminToken() {
  const login = await api.request('POST', '/api/auth/login', {
    body: { username: 'admin', password: 'admin123' }
  })
  assert.equal(login.status, 200)
  return login.data.token
}

describe('wallet P0', () => {
  it('TC-01: admin lists user wallet fields', async () => {
    const email = `wlist${Date.now()}@example.com`
    await registerFresh(email)
    const token = await adminToken()
    const res = await api.request('GET', '/api/wallet/users', { token })
    assert.equal(res.status, 200)
    const row = res.data.users.find((u) => u.email === email)
    assert.ok(row)
    assert.equal(row.balance_cents, 300)
    assert.ok('vip_level' in row)
    assert.ok('cumulative_recharge_cents' in row)
  })

  it('TC-02: admin-credit updates balance + ledger + cumulative', async () => {
    const email = `wcred${Date.now()}@example.com`
    const { user } = await registerFresh(email)
    const beforeCum = user.cumulative_recharge_cents
    const token = await adminToken()
    const credit = await api.request('POST', '/api/wallet/admin-credit', {
      token,
      body: { userId: user.id, amount_cents: 100 }
    })
    assert.equal(credit.status, 200)
    assert.ok(credit.data.user.balance_cents >= 300)
    assert.equal(credit.data.user.cumulative_recharge_cents, beforeCum + 100)
    const ledger = ledgerByUser(user.id, 'admin')
    assert.ok(ledger.some((r) => r.delta_cents === 100))
  })

  it('TC-03: user JWT cannot admin-credit', async () => {
    const email = `wnocred${Date.now()}@example.com`
    const { user, token: userTok } = await registerFresh(email)
    const bal = user.balance_cents
    const res = await api.request('POST', '/api/wallet/admin-credit', {
      token: userTok,
      body: { userId: user.id, amount_cents: 50 }
    })
    assert.equal(res.status, 403)
    assert.equal(res.data.code, 'FORBIDDEN')
    const row = db.prepare('SELECT balance_cents FROM users WHERE id = ?').get(user.id)
    assert.equal(row.balance_cents, bal)
  })

  it('TC-04: balance never goes negative on chat deny', async () => {
    const email = `wneg${Date.now()}@example.com`
    const { user, token } = await registerFresh(email)
    setUserBalanceCents(user.id, 0)
    const res = await api.request('POST', '/api/chat/completions', {
      token,
      body: { message: 'hello' }
    })
    assert.equal(res.status, 402)
    assert.equal(res.data.code, 'INSUFFICIENT_BALANCE')
    const row = db.prepare('SELECT balance_cents FROM users WHERE id = ?').get(user.id)
    assert.equal(row.balance_cents, 0)
  })
})
