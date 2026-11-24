/**
 * Customer service P0 — docs/spdd/4-测试条例/404home-customer-service-cases.md
 */
const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const {
  setupTestEnv,
  cleanupDb,
  startServer,
  setUserBalanceCents,
  ledgerByUser
} = require('./helpers')

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

async function secondAdminToken() {
  const bcrypt = require('bcryptjs')
  const hash = bcrypt.hashSync('agent2pass', 8)
  db.prepare('INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?, ?)').run(
    'agent2',
    hash
  )
  const login = await api.request('POST', '/api/auth/login', {
    body: { username: 'agent2', password: 'agent2pass' }
  })
  assert.equal(login.status, 200)
  return login.data.token
}

describe('cs P0', () => {
  it('TC-01: guest bootstrap returns JWT and 游客_ displayName', async () => {
    const res = await api.request('POST', '/api/cs/guest')
    assert.equal(res.status, 200)
    assert.ok(res.data.token)
    assert.match(res.data.displayName, /^游客_[a-z0-9]+$/i)
    const session = await api.request('POST', '/api/cs/sessions', {
      token: res.data.token
    })
    assert.equal(session.status, 200)
    assert.ok(session.data.session.id)
  })

  it('TC-02: FAQ label and keyword match script; miss uses fallback', async () => {
    const admin = await adminToken()
    await api.request('POST', '/api/cs/admin/scripts', {
      token: admin,
      body: {
        title: '充值',
        faq_label: '充值问题',
        keywords: ['到账'],
        body: '充值一般1到5分钟到账',
        sort: 1,
        enabled: true
      }
    })
    await api.request('PUT', '/api/cs/admin/settings', {
      token: admin,
      body: { fallback_message: '暂未匹配到问题，请换个说法或转人工' }
    })

    const guest = await api.request('POST', '/api/cs/guest')
    const token = guest.data.token
    const { data: opened } = await api.request('POST', '/api/cs/sessions', { token })
    const sid = opened.session.id

    const faq = await api.request('POST', `/api/cs/sessions/${sid}/messages`, {
      token,
      body: { content: '充值问题' }
    })
    assert.equal(faq.status, 200)
    assert.equal(faq.data.bot.content, '充值一般1到5分钟到账')

    const kw = await api.request('POST', `/api/cs/sessions/${sid}/messages`, {
      token,
      body: { content: '怎么还没到账啊' }
    })
    assert.equal(kw.status, 200)
    assert.equal(kw.data.bot.content, '充值一般1到5分钟到账')

    const miss = await api.request('POST', `/api/cs/sessions/${sid}/messages`, {
      token,
      body: { content: '今天天气如何' }
    })
    assert.equal(miss.status, 200)
    assert.match(miss.data.bot.content, /转人工|换个说法/)
  })

  it('TC-03: transfer assigns online admin', async () => {
    const admin = await adminToken()
    await api.request('POST', '/api/cs/admin/presence', {
      token: admin,
      body: { online: true }
    })

    const guest = await api.request('POST', '/api/cs/guest')
    const token = guest.data.token
    const { data: opened } = await api.request('POST', '/api/cs/sessions', { token })
    const sid = opened.session.id

    const tr = await api.request('POST', `/api/cs/sessions/${sid}/transfer`, { token })
    assert.equal(tr.status, 200)
    assert.equal(tr.data.session.status, 'human')
    assert.ok(tr.data.session.assignee_admin_id)
  })

  it('TC-04: transfer with no online agent queues with placebo', async () => {
    db.prepare('UPDATE cs_agent_presence SET online = 0').run()

    const guest = await api.request('POST', '/api/cs/guest')
    const token = guest.data.token
    const { data: opened } = await api.request('POST', '/api/cs/sessions', { token })
    const sid = opened.session.id

    const tr = await api.request('POST', `/api/cs/sessions/${sid}/transfer`, { token })
    assert.equal(tr.status, 200)
    assert.equal(tr.data.session.status, 'queued')
    assert.equal(tr.data.session.assignee_admin_id, null)
    const sys = (tr.data.messages || []).find((m) => m.role === 'system')
    assert.ok(sys)
    assert.match(sys.content, /排队/)
  })

  it('TC-05: only assignee agent can reply', async () => {
    const aTok = await adminToken()
    const bTok = await secondAdminToken()
    await api.request('POST', '/api/cs/admin/presence', {
      token: aTok,
      body: { online: true }
    })
    await api.request('POST', '/api/cs/admin/presence', {
      token: bTok,
      body: { online: false }
    })

    const guest = await api.request('POST', '/api/cs/guest')
    const token = guest.data.token
    const { data: opened } = await api.request('POST', '/api/cs/sessions', { token })
    const sid = opened.session.id
    const tr = await api.request('POST', `/api/cs/sessions/${sid}/transfer`, { token })
    assert.equal(tr.data.session.status, 'human')
    const assignee = tr.data.session.assignee_admin_id

    const aAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin')
    assert.equal(assignee, aAdmin.id)

    const ok = await api.request('POST', `/api/cs/admin/sessions/${sid}/messages`, {
      token: aTok,
      body: { content: '人工已接入' }
    })
    assert.equal(ok.status, 200)
    assert.equal(ok.data.message.role, 'agent')

    const denied = await api.request('POST', `/api/cs/admin/sessions/${sid}/messages`, {
      token: bTok,
      body: { content: '抢单' }
    })
    assert.equal(denied.status, 403)
  })

  it('TC-06: cs messages do not change wallet', async () => {
    const guest = await api.request('POST', '/api/cs/guest')
    const token = guest.data.token
    const me = await api.request('GET', '/api/user/me', { token })
    assert.equal(me.status, 200)
    const userId = me.data.user.id
    setUserBalanceCents(userId, 500)
    const { data: opened } = await api.request('POST', '/api/cs/sessions', { token })
    await api.request('POST', `/api/cs/sessions/${opened.session.id}/messages`, {
      token,
      body: { content: 'hello cs' }
    })
    const row = db.prepare('SELECT balance_cents FROM users WHERE id = ?').get(userId)
    assert.equal(row.balance_cents, 500)
    assert.equal(ledgerByUser(userId).length, 0)
  })
})
