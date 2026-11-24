const http = require('http')
const path = require('path')
const os = require('os')
const fs = require('fs')

function setupTestEnv() {
  const dbFile = path.join(
    os.tmpdir(),
    `404home-test-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.db`
  )
  process.env.DB_PATH = dbFile
  process.env.CAPTCHA_DEBUG = '1'
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
  return dbFile
}

function cleanupDb(dbFile) {
  for (const suffix of ['', '-wal', '-shm']) {
    const p = dbFile + suffix
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p)
    } catch {
      /* ignore */
    }
  }
}

async function startServer(app) {
  const server = http.createServer(app.callback())
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  const base = `http://127.0.0.1:${port}`

  async function request(method, urlPath, { body, token } = {}) {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(`${base}${urlPath}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
    const data = await res.json().catch(() => ({}))
    return { status: res.status, data }
  }

  /** Parse `data: <json>\n\n` SSE frames into event objects. */
  function parseSseText(text) {
    const events = []
    for (const block of String(text || '').split('\n\n')) {
      const line = block
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l.startsWith('data:'))
      if (!line) continue
      const raw = line.slice(5).trim()
      if (!raw || raw === '[DONE]') continue
      try {
        events.push(JSON.parse(raw))
      } catch {
        /* skip malformed */
      }
    }
    return events
  }

  async function requestStream(method, urlPath, { body, token } = {}) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream'
    }
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(`${base}${urlPath}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/event-stream')) {
      const data = await res.json().catch(() => ({}))
      return { status: res.status, data, events: [] }
    }
    const raw = await res.text()
    return { status: res.status, data: null, events: parseSseText(raw), raw }
  }

  async function close() {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()))
    })
  }

  return { base, request, requestStream, close, server }
}

/** CI / 本地计费测试：不打真实 DeepSeek */
function enableDeepseekStub() {
  process.env.DEEPSEEK_STUB = '1'
}

/** 测 DEEPSEEK_NOT_CONFIGURED：关闭 Stub 并清除 Key */
function disableDeepseekUpstream() {
  delete process.env.DEEPSEEK_STUB
  delete process.env.DEEPSEEK_API_KEY
}

function setUserBalanceCents(userId, cents) {
  const { db } = require('../db')
  db.prepare('UPDATE users SET balance_cents = ? WHERE id = ?').run(cents, userId)
}

function ledgerByUser(userId, reason) {
  const { db } = require('../db')
  if (reason) {
    return db
      .prepare(
        `SELECT * FROM wallet_ledger WHERE user_id = ? AND reason = ? ORDER BY id ASC`
      )
      .all(userId, reason)
  }
  return db
    .prepare(`SELECT * FROM wallet_ledger WHERE user_id = ? ORDER BY id ASC`)
    .all(userId)
}

module.exports = {
  setupTestEnv,
  cleanupDb,
  startServer,
  enableDeepseekStub,
  disableDeepseekUpstream,
  setUserBalanceCents,
  ledgerByUser
}
