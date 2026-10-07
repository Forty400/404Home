require('dotenv').config()

const Koa = require('koa')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser')
const { seed } = require('./seed')

const authRoutes = require('./routes/auth')
const userAuthRoutes = require('./routes/userAuth')
const chatRoutes = require('./routes/chat')
const walletRoutes = require('./routes/wallet')
const categoryRoutes = require('./routes/categories')
const toolRoutes = require('./routes/tools')
const postRoutes = require('./routes/posts')
const statsRoutes = require('./routes/stats')

seed()

const app = new Koa()
const PORT = Number(process.env.PORT) || 3001

app.use(cors())
app.use(bodyParser())

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    console.error(err)
    ctx.status = err.status || 500
    ctx.body = { error: err.message || '服务器错误' }
  }
})

app.use(authRoutes.routes()).use(authRoutes.allowedMethods())
app.use(userAuthRoutes.routes()).use(userAuthRoutes.allowedMethods())
app.use(chatRoutes.routes()).use(chatRoutes.allowedMethods())
app.use(walletRoutes.routes()).use(walletRoutes.allowedMethods())
app.use(categoryRoutes.routes()).use(categoryRoutes.allowedMethods())
app.use(toolRoutes.routes()).use(toolRoutes.allowedMethods())
app.use(postRoutes.routes()).use(postRoutes.allowedMethods())
app.use(statsRoutes.routes()).use(statsRoutes.allowedMethods())

app.use(async (ctx) => {
  if (ctx.path === '/api/health') {
    ctx.body = { ok: true }
    return
  }
  if (ctx.path.startsWith('/api')) {
    ctx.status = 404
    ctx.body = { error: '接口不存在' }
  }
})

app.listen(PORT, () => {
  console.log(`404Home API running at http://localhost:${PORT}`)
})
