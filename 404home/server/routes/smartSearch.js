const Router = require('koa-router')
const { smartSearch } = require('../services/smartSearch')
const { reindexAllTools } = require('../services/toolIndex')
const { authRequired } = require('../middleware/auth')

const router = new Router({ prefix: '/api/smart-search' })

const hits = new Map()

function rateLimitOk(key) {
  const limit = Math.max(1, Number(process.env.SMART_SEARCH_RATE_LIMIT_PER_MIN || 20))
  const now = Date.now()
  const windowMs = 60_000
  let bucket = hits.get(key)
  if (!bucket || now - bucket.start >= windowMs) {
    bucket = { start: now, count: 0 }
    hits.set(key, bucket)
  }
  bucket.count++
  return bucket.count <= limit
}

router.post('/', async (ctx) => {
  const ip = ctx.ip || ctx.request.ip || 'unknown'
  if (!rateLimitOk(ip)) {
    ctx.status = 429
    ctx.body = { error: '请求过于频繁', code: 'RATE_LIMITED' }
    return
  }

  const body = ctx.request.body || {}
  try {
    const result = await smartSearch({
      q: body.q,
      rerank: body.rerank
    })
    ctx.body = result
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = {
      error: err.message || '智能检索失败',
      code: err.code || 'SMART_SEARCH_ERROR'
    }
  }
})

router.post('/reindex', authRequired, async (ctx) => {
  try {
    const result = await reindexAllTools()
    ctx.body = { ok: true, ...result }
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = {
      error: err.message || '重建索引失败',
      code: err.code || 'REINDEX_ERROR'
    }
  }
})

module.exports = router
