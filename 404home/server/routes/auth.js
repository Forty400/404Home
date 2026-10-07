const Router = require('koa-router')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { db } = require('../db')

const router = new Router({ prefix: '/api/auth' })

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body || {}
  if (!username || !password) {
    ctx.status = 400
    ctx.body = { error: '请输入用户名和密码' }
    return
  }
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username)
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    ctx.status = 401
    ctx.body = { error: '用户名或密码错误' }
    return
  }
  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: 'admin' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  )
  ctx.body = { token, username: admin.username, role: 'admin' }
})

router.get('/me', async (ctx) => {
  const header = ctx.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    ctx.status = 401
    ctx.body = { error: '未登录' }
    return
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    if (payload.role === 'user') {
      ctx.status = 403
      ctx.body = { error: '需要管理员权限' }
      return
    }
    ctx.body = { id: payload.id, username: payload.username, role: 'admin' }
  } catch {
    ctx.status = 401
    ctx.body = { error: '登录已失效' }
  }
})

module.exports = router
