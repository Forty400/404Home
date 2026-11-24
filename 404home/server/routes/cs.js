const Router = require('koa-router')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { db } = require('../db')
const { userRequired, authRequired } = require('../middleware/auth')

const router = new Router({ prefix: '/api/cs' })

const GUEST_RE = /^guest_([a-z0-9]+)@guest\.local$/i

function signUser(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: 'user' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '30d' }
  )
}

function displayNameFor(user) {
  const m = String(user.email || '').match(GUEST_RE)
  if (m) return `游客_${m[1]}`
  return user.email || `user_${user.id}`
}

function setting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM cs_settings WHERE key = ?').get(key)
  return row ? row.value : fallback
}

function setSetting(key, value) {
  db.prepare(
    `INSERT INTO cs_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, String(value))
}

function parseKeywords(raw) {
  try {
    const v = JSON.parse(raw || '[]')
    return Array.isArray(v) ? v.map(String) : []
  } catch {
    return []
  }
}

function matchScript(text) {
  const q = String(text || '').trim().toLowerCase()
  if (!q) return null
  const scripts = db
    .prepare(
      `SELECT * FROM cs_scripts WHERE enabled = 1 ORDER BY sort ASC, id ASC`
    )
    .all()
  for (const s of scripts) {
    if (s.faq_label && String(s.faq_label).trim().toLowerCase() === q) return s
  }
  for (const s of scripts) {
    const kws = parseKeywords(s.keywords)
    if (kws.some((k) => k && q.includes(String(k).toLowerCase()))) return s
  }
  return null
}

function getSession(id) {
  return db.prepare('SELECT * FROM cs_sessions WHERE id = ?').get(id)
}

function touchSession(id) {
  db.prepare(`UPDATE cs_sessions SET updated_at = datetime('now') WHERE id = ?`).run(id)
}

function listMessages(sessionId) {
  return db
    .prepare(
      `SELECT id, session_id, role, admin_id, content, created_at
       FROM cs_messages WHERE session_id = ? ORDER BY id ASC`
    )
    .all(sessionId)
}

function insertMessage(sessionId, role, content, adminId = null) {
  const r = db
    .prepare(
      `INSERT INTO cs_messages (session_id, role, admin_id, content)
       VALUES (?, ?, ?, ?)`
    )
    .run(sessionId, role, adminId, content)
  touchSession(sessionId)
  return db.prepare('SELECT * FROM cs_messages WHERE id = ?').get(r.lastInsertRowid)
}

function assertSessionOwner(ctx, session) {
  if (!session || session.user_id !== ctx.state.user.id) {
    ctx.status = 404
    ctx.body = { error: '会话不存在', code: 'NOT_FOUND' }
    return false
  }
  return true
}

function onlineAdmins() {
  return db
    .prepare(
      `SELECT a.id, a.username FROM admins a
       INNER JOIN cs_agent_presence p ON p.admin_id = a.id
       WHERE p.online = 1`
    )
    .all()
}

function pickAssignee() {
  const list = onlineAdmins()
  if (!list.length) return null
  return list[Math.floor(Math.random() * list.length)]
}

/** Public: create guest user + JWT */
router.post('/guest', async (ctx) => {
  let suffix = crypto.randomBytes(4).toString('hex').slice(0, 6)
  let email = `guest_${suffix}@guest.local`
  for (let i = 0; i < 5; i++) {
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (!exists) break
    suffix = crypto.randomBytes(4).toString('hex').slice(0, 6)
    email = `guest_${suffix}@guest.local`
  }
  const r = db
    .prepare(
      `INSERT INTO users (email, password_hash, balance_cents, balance_cap_cents)
       VALUES (?, NULL, 0, 0)`
    )
    .run(email)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(r.lastInsertRowid)
  ctx.body = {
    token: signUser(user),
    user: { id: user.id, email: user.email },
    displayName: displayNameFor(user)
  }
})

router.get('/scripts/faq', async (ctx) => {
  const rows = db
    .prepare(
      `SELECT id, faq_label, sort FROM cs_scripts
       WHERE enabled = 1 AND faq_label IS NOT NULL AND TRIM(faq_label) != ''
       ORDER BY sort ASC, id ASC`
    )
    .all()
  ctx.body = { faqs: rows.map((r) => ({ id: r.id, label: r.faq_label, sort: r.sort })) }
})

router.post('/sessions', userRequired, async (ctx) => {
  const userId = ctx.state.user.id
  let session = db
    .prepare(
      `SELECT * FROM cs_sessions
       WHERE user_id = ? AND status IN ('bot', 'queued', 'human')
       ORDER BY id DESC LIMIT 1`
    )
    .get(userId)
  if (!session) {
    const r = db
      .prepare(`INSERT INTO cs_sessions (user_id, status) VALUES (?, 'bot')`)
      .run(userId)
    session = getSession(r.lastInsertRowid)
    insertMessage(
      session.id,
      'bot',
      '您好，请问需要什么帮助？可点选下方问题或直接输入。'
    )
  }
  ctx.body = {
    session,
    displayName: displayNameFor(db.prepare('SELECT * FROM users WHERE id = ?').get(userId)),
    messages: listMessages(session.id)
  }
})

router.get('/sessions/:id/messages', userRequired, async (ctx) => {
  const session = getSession(Number(ctx.params.id))
  if (!assertSessionOwner(ctx, session)) return
  ctx.body = { session, messages: listMessages(session.id) }
})

router.post('/sessions/:id/messages', userRequired, async (ctx) => {
  const session = getSession(Number(ctx.params.id))
  if (!assertSessionOwner(ctx, session)) return
  const content = String(ctx.request.body?.content || '').trim()
  if (!content) {
    ctx.status = 400
    ctx.body = { error: '消息不能为空', code: 'EMPTY' }
    return
  }
  const userMsg = insertMessage(session.id, 'user', content)

  if (session.status === 'human' || session.status === 'queued') {
    ctx.body = { user: userMsg, bot: null, session: getSession(session.id) }
    return
  }

  const script = matchScript(content)
  const reply = script
    ? script.body
    : setting('fallback_message', '暂未匹配到问题，请换个说法或转人工')
  const bot = insertMessage(session.id, 'bot', reply)
  ctx.body = { user: userMsg, bot, session: getSession(session.id) }
})

router.post('/sessions/:id/transfer', userRequired, async (ctx) => {
  const session = getSession(Number(ctx.params.id))
  if (!assertSessionOwner(ctx, session)) return

  if (session.status === 'human' && session.assignee_admin_id) {
    ctx.body = { session, messages: listMessages(session.id) }
    return
  }

  const agent = pickAssignee()
  if (!agent) {
    db.prepare(
      `UPDATE cs_sessions SET status = 'queued', assignee_admin_id = NULL,
       updated_at = datetime('now') WHERE id = ?`
    ).run(session.id)
    const msg = setting('queue_message', '当前询问人数过多，正在排队')
    insertMessage(session.id, 'system', msg)
    ctx.body = { session: getSession(session.id), messages: listMessages(session.id) }
    return
  }

  db.prepare(
    `UPDATE cs_sessions SET status = 'human', assignee_admin_id = ?,
     updated_at = datetime('now') WHERE id = ?`
  ).run(agent.id, session.id)
  insertMessage(session.id, 'system', `已为您接入客服`)
  ctx.body = { session: getSession(session.id), messages: listMessages(session.id) }
})

/* —— Admin —— */

router.get('/admin/inbox', authRequired, async (ctx) => {
  const sessions = db
    .prepare(
      `SELECT s.*, u.email AS user_email,
         (SELECT content FROM cs_messages m WHERE m.session_id = s.id ORDER BY m.id DESC LIMIT 1) AS last_content
       FROM cs_sessions s
       LEFT JOIN users u ON u.id = s.user_id
       WHERE s.status IN ('bot', 'queued', 'human')
       ORDER BY
         CASE s.status WHEN 'queued' THEN 0 WHEN 'human' THEN 1 ELSE 2 END,
         s.updated_at DESC
       LIMIT 100`
    )
    .all()
  ctx.body = {
    sessions: sessions.map((s) => ({
      ...s,
      displayName: displayNameFor({ email: s.user_email })
    }))
  }
})

router.get('/admin/sessions/:id', authRequired, async (ctx) => {
  const session = getSession(Number(ctx.params.id))
  if (!session) {
    ctx.status = 404
    ctx.body = { error: '会话不存在', code: 'NOT_FOUND' }
    return
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id)
  ctx.body = {
    session,
    user: user
      ? { id: user.id, email: user.email, displayName: displayNameFor(user) }
      : null,
    messages: listMessages(session.id)
  }
})

router.post('/admin/sessions/:id/messages', authRequired, async (ctx) => {
  const session = getSession(Number(ctx.params.id))
  if (!session) {
    ctx.status = 404
    ctx.body = { error: '会话不存在', code: 'NOT_FOUND' }
    return
  }
  const adminId = ctx.state.user.id
  if (session.status !== 'human' || session.assignee_admin_id !== adminId) {
    ctx.status = 403
    ctx.body = { error: '无权回复该会话', code: 'FORBIDDEN' }
    return
  }
  const content = String(ctx.request.body?.content || '').trim()
  if (!content) {
    ctx.status = 400
    ctx.body = { error: '消息不能为空', code: 'EMPTY' }
    return
  }
  const message = insertMessage(session.id, 'agent', content, adminId)
  ctx.body = { message, session: getSession(session.id) }
})

router.get('/admin/presence', authRequired, async (ctx) => {
  const adminId = ctx.state.user.id
  const mine = db
    .prepare('SELECT * FROM cs_agent_presence WHERE admin_id = ?')
    .get(adminId)
  ctx.body = {
    online: !!(mine && mine.online),
    onlineAgents: onlineAdmins()
  }
})

router.post('/admin/presence', authRequired, async (ctx) => {
  const adminId = ctx.state.user.id
  const online = !!ctx.request.body?.online
  db.prepare(
    `INSERT INTO cs_agent_presence (admin_id, online, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(admin_id) DO UPDATE SET
       online = excluded.online,
       updated_at = datetime('now')`
  ).run(adminId, online ? 1 : 0)
  ctx.body = { online }
})

router.get('/admin/scripts', authRequired, async (ctx) => {
  const scripts = db
    .prepare(`SELECT * FROM cs_scripts ORDER BY sort ASC, id ASC`)
    .all()
    .map((s) => ({ ...s, keywords: parseKeywords(s.keywords), enabled: !!s.enabled }))
  ctx.body = { scripts }
})

router.post('/admin/scripts', authRequired, async (ctx) => {
  const b = ctx.request.body || {}
  const keywords = Array.isArray(b.keywords) ? b.keywords : parseKeywords(b.keywords)
  const r = db
    .prepare(
      `INSERT INTO cs_scripts (title, faq_label, keywords, body, sort, enabled)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(b.title || ''),
      b.faq_label != null ? String(b.faq_label) : null,
      JSON.stringify(keywords),
      String(b.body || ''),
      Number(b.sort) || 100,
      b.enabled === false ? 0 : 1
    )
  const script = db.prepare('SELECT * FROM cs_scripts WHERE id = ?').get(r.lastInsertRowid)
  ctx.body = {
    script: {
      ...script,
      keywords: parseKeywords(script.keywords),
      enabled: !!script.enabled
    }
  }
})

router.put('/admin/scripts/:id', authRequired, async (ctx) => {
  const id = Number(ctx.params.id)
  const existing = db.prepare('SELECT * FROM cs_scripts WHERE id = ?').get(id)
  if (!existing) {
    ctx.status = 404
    ctx.body = { error: '话术不存在', code: 'NOT_FOUND' }
    return
  }
  const b = ctx.request.body || {}
  const keywords =
    b.keywords !== undefined
      ? Array.isArray(b.keywords)
        ? b.keywords
        : parseKeywords(b.keywords)
      : parseKeywords(existing.keywords)
  db.prepare(
    `UPDATE cs_scripts SET title = ?, faq_label = ?, keywords = ?, body = ?,
     sort = ?, enabled = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(
    b.title !== undefined ? String(b.title) : existing.title,
    b.faq_label !== undefined ? (b.faq_label == null ? null : String(b.faq_label)) : existing.faq_label,
    JSON.stringify(keywords),
    b.body !== undefined ? String(b.body) : existing.body,
    b.sort !== undefined ? Number(b.sort) : existing.sort,
    b.enabled !== undefined ? (b.enabled ? 1 : 0) : existing.enabled,
    id
  )
  const script = db.prepare('SELECT * FROM cs_scripts WHERE id = ?').get(id)
  ctx.body = {
    script: {
      ...script,
      keywords: parseKeywords(script.keywords),
      enabled: !!script.enabled
    }
  }
})

router.delete('/admin/scripts/:id', authRequired, async (ctx) => {
  db.prepare('DELETE FROM cs_scripts WHERE id = ?').run(Number(ctx.params.id))
  ctx.body = { ok: true }
})

router.get('/admin/settings', authRequired, async (ctx) => {
  const rows = db.prepare('SELECT key, value FROM cs_settings').all()
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  ctx.body = { settings }
})

router.put('/admin/settings', authRequired, async (ctx) => {
  const b = ctx.request.body || {}
  for (const key of ['mode', 'queue_message', 'fallback_message']) {
    if (b[key] !== undefined) setSetting(key, b[key])
  }
  const rows = db.prepare('SELECT key, value FROM cs_settings').all()
  ctx.body = { settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) }
})

module.exports = router
