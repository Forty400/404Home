const Router = require('koa-router')
const { db } = require('../db')

const router = new Router({ prefix: '/api/analytics' })

const MAX_PATH = 512
const MAX_VISITOR = 128

router.post('/pageview', async (ctx) => {
  const path = String(ctx.request.body?.path || '').trim()
  const visitorId = String(ctx.request.body?.visitorId || '').trim()
  if (!path || path.length > MAX_PATH) {
    ctx.status = 400
    ctx.body = { error: '无效路径', code: 'BAD_PATH' }
    return
  }
  if (!visitorId || visitorId.length > MAX_VISITOR) {
    ctx.status = 400
    ctx.body = { error: '无效访客', code: 'BAD_VISITOR' }
    return
  }
  // skip admin SPA noise
  if (path.startsWith('/admin')) {
    ctx.body = { ok: true, skipped: true }
    return
  }
  db.prepare(`INSERT INTO page_views (path, visitor_id) VALUES (?, ?)`).run(path, visitorId)
  ctx.body = { ok: true }
})

module.exports = router
