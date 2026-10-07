const Router = require('koa-router')
const { db } = require('../db')
const { userRequired, authRequired } = require('../middleware/auth')
const { getUser, publicUser, chargeChat } = require('../services/wallet')
const { chatCompletions, getConfig, isConfigured } = require('../services/deepseek')

const router = new Router({ prefix: '/api/chat' })

/** Admin: usage summary + top users */
router.get('/admin/summary', authRequired, async (ctx) => {
  const totals = db
    .prepare(
      `SELECT
         COUNT(DISTINCT s.id) AS session_count,
         COUNT(m.id) AS message_count,
         COALESCE(SUM(m.prompt_tokens), 0) AS prompt_tokens,
         COALESCE(SUM(m.completion_tokens), 0) AS completion_tokens,
         COALESCE(SUM(m.cost_cents), 0) AS cost_cents
       FROM chat_sessions s
       LEFT JOIN chat_messages m ON m.session_id = s.id`
    )
    .get()

  const byUser = db
    .prepare(
      `SELECT
         u.id AS user_id,
         u.email,
         COUNT(DISTINCT s.id) AS session_count,
         COALESCE(SUM(m.prompt_tokens), 0) AS prompt_tokens,
         COALESCE(SUM(m.completion_tokens), 0) AS completion_tokens,
         COALESCE(SUM(m.cost_cents), 0) AS cost_cents
       FROM users u
       INNER JOIN chat_sessions s ON s.user_id = u.id
       LEFT JOIN chat_messages m ON m.session_id = s.id
       WHERE (u.deleted_at IS NULL OR u.deleted_at = '')
       GROUP BY u.id
       ORDER BY cost_cents DESC
       LIMIT 20`
    )
    .all()

  ctx.body = { totals, byUser }
})

/** Admin: session list */
router.get('/admin/sessions', authRequired, async (ctx) => {
  const q = String(ctx.query.q || '').trim().toLowerCase()
  const limit = Math.min(200, Math.max(1, Number(ctx.query.limit) || 50))
  const params = []
  let where = '1=1'
  if (q) {
    where += ' AND LOWER(IFNULL(u.email, \'\')) LIKE ?'
    params.push(`%${q}%`)
  }
  params.push(limit)
  const sessions = db
    .prepare(
      `SELECT
         s.id,
         s.user_id,
         u.email,
         s.title,
         s.created_at,
         s.updated_at,
         COUNT(m.id) AS message_count,
         COALESCE(SUM(m.prompt_tokens), 0) AS prompt_tokens,
         COALESCE(SUM(m.completion_tokens), 0) AS completion_tokens,
         COALESCE(SUM(m.cost_cents), 0) AS cost_cents
       FROM chat_sessions s
       LEFT JOIN users u ON u.id = s.user_id
       LEFT JOIN chat_messages m ON m.session_id = s.id
       WHERE ${where}
       GROUP BY s.id
       ORDER BY s.updated_at DESC
       LIMIT ?`
    )
    .all(...params)
  ctx.body = { sessions }
})

/** Admin: session detail + messages */
router.get('/admin/sessions/:id', authRequired, async (ctx) => {
  const session = db
    .prepare(
      `SELECT s.id, s.user_id, u.email, s.title, s.created_at, s.updated_at
       FROM chat_sessions s
       LEFT JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .get(ctx.params.id)
  if (!session) {
    ctx.status = 404
    ctx.body = { error: '会话不存在', code: 'SESSION_NOT_FOUND' }
    return
  }
  const messages = db
    .prepare(
      `SELECT id, role, content, prompt_tokens, completion_tokens, cost_cents, created_at
       FROM chat_messages WHERE session_id = ? ORDER BY id ASC`
    )
    .all(session.id)
  const usage = db
    .prepare(
      `SELECT
         COUNT(*) AS message_count,
         COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens,
         COALESCE(SUM(completion_tokens), 0) AS completion_tokens,
         COALESCE(SUM(cost_cents), 0) AS cost_cents
       FROM chat_messages WHERE session_id = ?`
    )
    .get(session.id)
  ctx.body = { session, messages, usage }
})


router.get('/status', userRequired, async (ctx) => {
  ctx.body = {
    configured: isConfigured(),
    model: getConfig().model
  }
})

router.get('/sessions', userRequired, async (ctx) => {
  const rows = db
    .prepare(
      `SELECT id, title, created_at, updated_at FROM chat_sessions
       WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50`
    )
    .all(ctx.state.user.id)
  ctx.body = { sessions: rows }
})

router.get('/sessions/:id/messages', userRequired, async (ctx) => {
  const session = db
    .prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?')
    .get(ctx.params.id, ctx.state.user.id)
  if (!session) {
    ctx.status = 404
    ctx.body = { error: '会话不存在', code: 'SESSION_NOT_FOUND' }
    return
  }
  const messages = db
    .prepare(
      `SELECT id, role, content, prompt_tokens, completion_tokens, cost_cents, created_at
       FROM chat_messages WHERE session_id = ? ORDER BY id ASC`
    )
    .all(session.id)
  ctx.body = { session, messages }
})

router.delete('/sessions/:id', userRequired, async (ctx) => {
  const session = db
    .prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?')
    .get(ctx.params.id, ctx.state.user.id)
  if (!session) {
    ctx.status = 404
    ctx.body = { error: '会话不存在', code: 'SESSION_NOT_FOUND' }
    return
  }
  db.prepare('DELETE FROM chat_messages WHERE session_id = ?').run(session.id)
  db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(session.id)
  ctx.body = { ok: true, id: session.id }
})

router.post('/completions', userRequired, async (ctx) => {
  const { message, sessionId } = ctx.request.body || {}
  const text = String(message || '').trim()
  if (!text) {
    ctx.status = 400
    ctx.body = { error: '消息不能为空', code: 'EMPTY_MESSAGE' }
    return
  }
  if (text.length > 8000) {
    ctx.status = 400
    ctx.body = { error: '消息过长', code: 'MESSAGE_TOO_LONG' }
    return
  }

  const user = getUser(ctx.state.user.id)
  if (!user) {
    ctx.status = 401
    ctx.body = { error: '用户不存在或已注销', code: 'USER_GONE' }
    return
  }
  if (user.balance_cents <= 0) {
    ctx.status = 402
    ctx.body = { error: '余额不足，请联系运营加额', code: 'INSUFFICIENT_BALANCE' }
    return
  }
  if (!isConfigured()) {
    ctx.status = 503
    ctx.body = { error: 'DeepSeek API Key 未配置', code: 'DEEPSEEK_NOT_CONFIGURED' }
    return
  }

  let session
  if (sessionId) {
    session = db
      .prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?')
      .get(sessionId, user.id)
    if (!session) {
      ctx.status = 404
      ctx.body = { error: '会话不存在', code: 'SESSION_NOT_FOUND' }
      return
    }
  } else {
    const title = text.slice(0, 40)
    const info = db
      .prepare('INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)')
      .run(user.id, title)
    session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(info.lastInsertRowid)
  }

  const maxHistory = getConfig().maxHistory
  const history = db
    .prepare(
      `SELECT role, content FROM chat_messages
       WHERE session_id = ? AND role IN ('user', 'assistant')
       ORDER BY id DESC LIMIT ?`
    )
    .all(session.id, maxHistory)
    .reverse()

  const apiMessages = [
    { role: 'system', content: '你是 404Home 提供的 DeepSeek 试用助手，回答简洁有用。' },
    ...history,
    { role: 'user', content: text }
  ]

  db.prepare(
    `INSERT INTO chat_messages (session_id, role, content) VALUES (?, 'user', ?)`
  ).run(session.id, text)

  let result
  try {
    result = await chatCompletions(apiMessages)
  } catch (err) {
    ctx.status = err.status || 502
    ctx.body = { error: err.message || '上游调用失败', code: err.code || 'DEEPSEEK_UPSTREAM' }
    return
  }

  const assistantInfo = db
    .prepare(
      `INSERT INTO chat_messages
        (session_id, role, content, prompt_tokens, completion_tokens, cost_cents)
       VALUES (?, 'assistant', ?, ?, ?, ?)`
    )
    .run(
      session.id,
      result.content,
      result.usage.prompt_tokens,
      result.usage.completion_tokens,
      result.cost_cents
    )

  let charged = { user, charged_cents: 0 }
  try {
    charged = chargeChat(user.id, result.cost_cents, `msg_${assistantInfo.lastInsertRowid}`)
  } catch (err) {
    // Should be rare (balance raced to 0); still return reply
    if (err.code !== 'INSUFFICIENT_BALANCE') throw err
  }

  db.prepare(
    `UPDATE chat_sessions SET updated_at = datetime('now'), title = CASE
       WHEN title = '新对话' THEN ? ELSE title END WHERE id = ?`
  ).run(text.slice(0, 40), session.id)

  ctx.body = {
    sessionId: session.id,
    message: {
      id: assistantInfo.lastInsertRowid,
      role: 'assistant',
      content: result.content,
      prompt_tokens: result.usage.prompt_tokens,
      completion_tokens: result.usage.completion_tokens,
      cost_cents: result.cost_cents
    },
    charged_cents: charged.charged_cents,
    user: publicUser(charged.user || getUser(user.id))
  }
})

module.exports = router
