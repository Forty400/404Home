const jwt = require('jsonwebtoken')

function getToken(ctx) {
  const header = ctx.get('authorization') || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return null
}

function verifyPayload(ctx) {
  const token = getToken(ctx)
  if (!token) {
    ctx.status = 401
    ctx.body = { error: '未登录', code: 'UNAUTHORIZED' }
    return null
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    ctx.state.user = payload
    return payload
  } catch {
    ctx.status = 401
    ctx.body = { error: '登录已失效', code: 'TOKEN_INVALID' }
    return null
  }
}

function isAdminPayload(payload) {
  if (!payload) return false
  if (payload.role === 'admin') return true
  // legacy admin tokens (no role)
  return !payload.role && payload.username && !payload.email
}

function isUserPayload(payload) {
  return payload && payload.role === 'user'
}

/** Admin CMS routes */
function authRequired(ctx, next) {
  const payload = verifyPayload(ctx)
  if (!payload) return
  if (!isAdminPayload(payload)) {
    ctx.status = 403
    ctx.body = { error: '需要管理员权限', code: 'FORBIDDEN' }
    return
  }
  return next()
}

const adminRequired = authRequired

/** C-end user routes */
function userRequired(ctx, next) {
  const payload = verifyPayload(ctx)
  if (!payload) return
  if (!isUserPayload(payload)) {
    ctx.status = 403
    ctx.body = { error: '需要用户登录', code: 'FORBIDDEN' }
    return
  }
  return next()
}

module.exports = {
  authRequired,
  adminRequired,
  userRequired,
  getToken,
  isAdminPayload,
  isUserPayload
}
