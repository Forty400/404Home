/**
 * Architecture P0 — docs/spdd/4-测试条例/404home-architecture-cases.md
 * TC-01 … TC-04
 */
const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')
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

async function registerUser(email) {
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

function adminJwt() {
  return jwt.sign(
    { id: 1, username: 'admin', role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
}

describe('architecture P0', () => {
  it('TC-01: unauthenticated user/chat APIs → 401 with error', async () => {
    const me = await api.request('GET', '/api/user/me')
    assert.equal(me.status, 401)
    assert.ok(me.data.error)

    const chat = await api.request('POST', '/api/chat/completions', {
      body: { messages: [{ role: 'user', content: 'hi' }] }
    })
    assert.equal(chat.status, 401)
    assert.ok(chat.data.error)
  })

  it('TC-02: admin JWT cannot use user or chat completions', async () => {
    const token = adminJwt()
    const me = await api.request('GET', '/api/user/me', { token })
    assert.ok(me.status === 401 || me.status === 403)
    assert.ok(me.data.error)

    const chat = await api.request('POST', '/api/chat/completions', {
      token,
      body: { messages: [{ role: 'user', content: 'hi' }] }
    })
    assert.ok(chat.status === 401 || chat.status === 403)
    assert.ok(chat.data.error)
  })

  it('TC-03: user JWT cannot use admin-credit or chat admin', async () => {
    const { token } = await registerUser(`arch${Date.now()}@example.com`)
    const credit = await api.request('POST', '/api/wallet/admin-credit', {
      token,
      body: { userId: 1, amount_cents: 10 }
    })
    assert.ok(credit.status === 401 || credit.status === 403)
    assert.ok(credit.data.error)

    const summary = await api.request('GET', '/api/chat/admin/summary', { token })
    assert.ok(summary.status === 401 || summary.status === 403)
    assert.ok(summary.data.error)
  })

  it('TC-04: frontend src has no third-party secret-shaped strings', () => {
    const srcRoot = path.join(__dirname, '../../src')
    const secretish =
      /sk-[a-zA-Z0-9]{20,}|DEEPSEEK_API_KEY\s*[:=]\s*['"][^'"]+['"]|WECHAT_.*(SECRET|KEY)\s*[:=]\s*['"][^'"]+['"]/i
    const hits = []

    function walk(dir) {
      for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name)
        const st = fs.statSync(p)
        if (st.isDirectory()) walk(p)
        else if (/\.(js|vue|ts|tsx|env)$/i.test(name)) {
          const text = fs.readFileSync(p, 'utf8')
          if (secretish.test(text)) hits.push(p)
        }
      }
    }

    walk(srcRoot)
    assert.deepEqual(hits, [], `secret-like strings in: ${hits.join(', ')}`)
  })
})
