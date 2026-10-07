const Router = require('koa-router')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { db } = require('../db')
const { userRequired } = require('../middleware/auth')
const { createCaptcha, consumeCaptcha } = require('../services/captcha')

const router = new Router({ prefix: '/api/user' })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GRANT_CENTS = 300
const CAP_CENTS = 300

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    vip_level: row.vip_level,
    balance_cents: row.balance_cents,
    balance_cap_cents: row.balance_cap_cents,
    cumulative_recharge_cents: row.cumulative_recharge_cents,
    status: row.status,
    created_at: row.created_at
  }
}

function signUser(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: 'user' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '30d' }
  )
}

router.get('/captcha', async (ctx) => {
  const created = createCaptcha()
  ctx.body = {
    captchaId: created.id,
    svg: created.svg,
    ...(created.code ? { debugCode: created.code } : {})
  }
})

router.post('/register', async (ctx) => {
  const { email, password, captchaId, captchaCode } = ctx.request.body || {}
  if (!email || !password) {
    ctx.status = 400
    ctx.body = { error: '请填写邮箱和密码', code: 'INVALID_INPUT' }
    return
  }
  const normalized = String(email).trim().toLowerCase()
  if (!EMAIL_RE.test(normalized)) {
    ctx.status = 400
    ctx.body = { error: '邮箱格式不正确', code: 'INVALID_EMAIL' }
    return
  }
  if (String(password).length < 6) {
    ctx.status = 400
    ctx.body = { error: '密码至少 6 位', code: 'WEAK_PASSWORD' }
    return
  }
  if (!consumeCaptcha(captchaId, captchaCode)) {
    ctx.status = 400
    ctx.body = { error: '验证码错误或已过期', code: 'CAPTCHA_INVALID' }
    return
  }

  const existing = db
    .prepare(
      `SELECT id FROM users WHERE email = ? AND (deleted_at IS NULL OR deleted_at = '')`
    )
    .get(normalized)
  if (existing) {
    ctx.status = 409
    ctx.body = { error: '该邮箱已注册', code: 'EMAIL_EXISTS' }
    return
  }

  const password_hash = bcrypt.hashSync(String(password), 10)
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, vip_level, balance_cents, balance_cap_cents, status)
    VALUES (?, ?, 0, ?, ?, 'active')
  `)
  const insertLedger = db.prepare(`
    INSERT INTO wallet_ledger (user_id, delta_cents, reason, ref_id)
    VALUES (?, ?, 'grant', 'register')
  `)

  let userId
  const tx = db.transaction(() => {
    const info = insertUser.run(normalized, password_hash, GRANT_CENTS, CAP_CENTS)
    userId = info.lastInsertRowid
    insertLedger.run(userId, GRANT_CENTS)
  })
  tx()

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  const token = signUser(user)
  ctx.body = { token, user: publicUser(user) }
})

router.post('/login', async (ctx) => {
  const { email, password } = ctx.request.body || {}
  if (!email || !password) {
    ctx.status = 400
    ctx.body = { error: '请填写邮箱和密码', code: 'INVALID_INPUT' }
    return
  }
  const normalized = String(email).trim().toLowerCase()
  const user = db
    .prepare(
      `SELECT * FROM users WHERE email = ? AND status = 'active' AND (deleted_at IS NULL OR deleted_at = '')`
    )
    .get(normalized)
  if (!user || !user.password_hash || !bcrypt.compareSync(String(password), user.password_hash)) {
    ctx.status = 401
    ctx.body = { error: '邮箱或密码错误', code: 'LOGIN_FAILED' }
    return
  }
  ctx.body = { token: signUser(user), user: publicUser(user) }
})

router.get('/me', userRequired, async (ctx) => {
  const user = db
    .prepare(
      `SELECT * FROM users WHERE id = ? AND status = 'active' AND (deleted_at IS NULL OR deleted_at = '')`
    )
    .get(ctx.state.user.id)
  if (!user) {
    ctx.status = 401
    ctx.body = { error: '用户不存在或已注销', code: 'USER_GONE' }
    return
  }
  ctx.body = { user: publicUser(user) }
})

module.exports = router
