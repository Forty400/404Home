const Router = require('koa-router')
const { db } = require('../db')
const { authRequired } = require('../middleware/auth')

const router = new Router({ prefix: '/api/stats' })

function rangeAgg(sinceSql) {
  const pv = db
    .prepare(
      `SELECT COUNT(*) AS c FROM page_views WHERE created_at >= datetime('now', ?)`
    )
    .get(sinceSql).c
  const uv = db
    .prepare(
      `SELECT COUNT(DISTINCT visitor_id) AS c FROM page_views WHERE created_at >= datetime('now', ?)`
    )
    .get(sinceSql).c
  return { pv, uv }
}

function todayAgg() {
  const pv = db
    .prepare(
      `SELECT COUNT(*) AS c FROM page_views WHERE date(created_at) = date('now')`
    )
    .get().c
  const uv = db
    .prepare(
      `SELECT COUNT(DISTINCT visitor_id) AS c FROM page_views WHERE date(created_at) = date('now')`
    )
    .get().c
  return { pv, uv }
}

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

/** Visit metrics for delivery dashboard */
router.get('/traffic', authRequired, async (ctx) => {
  const days = Math.min(90, Math.max(7, Number(ctx.query.days) || 30))

  const daily = db
    .prepare(
      `SELECT date(created_at) AS day,
              COUNT(*) AS pv,
              COUNT(DISTINCT visitor_id) AS uv
       FROM page_views
       WHERE created_at >= datetime('now', ?)
       GROUP BY date(created_at)
       ORDER BY day ASC`
    )
    .all(`-${days} days`)

  // fill missing days with 0 for chart continuity
  const map = new Map(daily.map((r) => [r.day, r]))
  const filled = []
  for (let i = days - 1; i >= 0; i--) {
    const row = db
      .prepare(`SELECT date('now', ?) AS day`)
      .get(`-${i} days`)
    const day = row.day
    const hit = map.get(day)
    filled.push({
      day,
      pv: hit ? hit.pv : 0,
      uv: hit ? hit.uv : 0
    })
  }

  const topPaths = db
    .prepare(
      `SELECT path, COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv
       FROM page_views
       WHERE created_at >= datetime('now', '-30 days')
       GROUP BY path
       ORDER BY pv DESC
       LIMIT 10`
    )
    .all()

  ctx.body = {
    today: todayAgg(),
    days7: rangeAgg('-7 days'),
    days30: rangeAgg('-30 days'),
    daily: filled,
    topPaths
  }
})

module.exports = router
