const jwt = require('jsonwebtoken')

function getToken(ctx) {
  const header = ctx.get('authorization') || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return null
}

function authRequired(ctx, next) {
  const token = getToken(ctx)
  if (!token) {
    ctx.status = 401
    ctx.body = { error: '未登录' }
    return
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    ctx.state.user = payload
    return next()
  } catch {
    ctx.status = 401
    ctx.body = { error: '登录已失效' }
  }
}

module.exports = { authRequired, getToken }
