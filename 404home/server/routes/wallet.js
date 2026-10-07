const Router = require('koa-router')
const { db } = require('../db')
const { authRequired } = require('../middleware/auth')
const { adminCredit, publicUser } = require('../services/wallet')

const router = new Router({ prefix: '/api/wallet' })

router.get('/users', authRequired, async (ctx) => {
  const q = String(ctx.query.q || '').trim().toLowerCase()
  let rows
  if (q) {
    rows = db
      .prepare(
        `SELECT id, email, vip_level, balance_cents, balance_cap_cents,
                cumulative_recharge_cents, status, created_at
         FROM users
         WHERE (deleted_at IS NULL OR deleted_at = '')
           AND email LIKE ?
         ORDER BY id DESC
         LIMIT 100`
      )
      .all(`%${q}%`)
  } else {
    rows = db
      .prepare(
        `SELECT id, email, vip_level, balance_cents, balance_cap_cents,
                cumulative_recharge_cents, status, created_at
         FROM users
         WHERE (deleted_at IS NULL OR deleted_at = '')
         ORDER BY id DESC
         LIMIT 100`
      )
      .all()
  }
  ctx.body = { users: rows }
})

router.post('/admin-credit', authRequired, async (ctx) => {
  const { userId, email, amount_cents: amountCents } = ctx.request.body || {}
  let id = userId
  if (!id && email) {
    const row = getUserByEmail(String(email).trim().toLowerCase())
    if (!row) {
      ctx.status = 404
      ctx.body = { error: '用户不存在', code: 'USER_NOT_FOUND' }
      return
    }
    id = row.id
  }
  if (!id) {
    ctx.status = 400
    ctx.body = { error: '请提供 userId 或 email', code: 'INVALID_INPUT' }
    return
  }

  try {
    const result = adminCredit(id, Number(amountCents))
    ctx.body = {
      ...result,
      user: publicUser(result.user)
    }
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = { error: err.message || '加额失败', code: err.code || 'CREDIT_FAILED' }
  }
})

function getUserByEmail(email) {
  return db
    .prepare(
      `SELECT * FROM users WHERE email = ? AND status = 'active' AND (deleted_at IS NULL OR deleted_at = '')`
    )
    .get(email)
}

module.exports = router
