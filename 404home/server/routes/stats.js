const Router = require('koa-router')
const { db } = require('../db')
const { authRequired } = require('../middleware/auth')

const router = new Router({ prefix: '/api/stats' })

router.get('/', authRequired, async (ctx) => {
  ctx.body = {
    tools: db.prepare('SELECT COUNT(*) AS c FROM tools').get().c,
    categories: db.prepare('SELECT COUNT(*) AS c FROM categories').get().c,
    news: db.prepare("SELECT COUNT(*) AS c FROM posts WHERE type = 'news'").get().c,
    tutorials: db.prepare("SELECT COUNT(*) AS c FROM posts WHERE type = 'tutorial'").get().c,
    hotTools: db.prepare('SELECT COUNT(*) AS c FROM tools WHERE is_hot = 1').get().c,
    users: db
      .prepare(
        `SELECT COUNT(*) AS c FROM users WHERE (deleted_at IS NULL OR deleted_at = '')`
      )
      .get().c
  }
})

module.exports = router
