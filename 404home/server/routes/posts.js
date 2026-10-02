const Router = require('koa-router')
const { db, parsePost } = require('../db')
const { authRequired } = require('../middleware/auth')

const router = new Router({ prefix: '/api/posts' })

router.get('/', async (ctx) => {
  const { type, all } = ctx.query
  const where = []
  const params = {}
  if (type) {
    where.push('type = @type')
    params.type = type
  }
  if (all !== '1') {
    where.push('published = 1')
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const rows = db
    .prepare(`SELECT * FROM posts ${whereSql} ORDER BY created_at DESC, id DESC`)
    .all(params)
  ctx.body = rows.map(parsePost)
})

router.get('/:id', async (ctx) => {
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(Number(ctx.params.id))
  if (!row) {
    ctx.status = 404
    ctx.body = { error: '文章不存在' }
    return
  }
  ctx.body = parsePost(row)
})

router.post('/', authRequired, async (ctx) => {
  const body = ctx.request.body || {}
  const {
    type = 'news',
    title,
    summary = '',
    content = '',
    cover = '',
    published = true
  } = body
  if (!title || !['news', 'tutorial'].includes(type)) {
    ctx.status = 400
    ctx.body = { error: '标题必填，且 type 须为 news 或 tutorial' }
    return
  }
  const result = db
    .prepare(
      `INSERT INTO posts (type, title, summary, content, cover, published)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(type, title, summary, content, cover, published ? 1 : 0)
  ctx.body = parsePost(db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid))
})

router.put('/:id', authRequired, async (ctx) => {
  const id = Number(ctx.params.id)
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(id)
  if (!existing) {
    ctx.status = 404
    ctx.body = { error: '文章不存在' }
    return
  }
  const body = ctx.request.body || {}
  const next = {
    type: body.type ?? existing.type,
    title: body.title ?? existing.title,
    summary: body.summary ?? existing.summary,
    content: body.content ?? existing.content,
    cover: body.cover ?? existing.cover,
    published: body.published !== undefined ? (body.published ? 1 : 0) : existing.published
  }
  if (!['news', 'tutorial'].includes(next.type)) {
    ctx.status = 400
    ctx.body = { error: 'type 须为 news 或 tutorial' }
    return
  }
  db.prepare(
    `UPDATE posts SET type=?, title=?, summary=?, content=?, cover=?, published=? WHERE id=?`
  ).run(next.type, next.title, next.summary, next.content, next.cover, next.published, id)
  ctx.body = parsePost(db.prepare('SELECT * FROM posts WHERE id = ?').get(id))
})

router.delete('/:id', authRequired, async (ctx) => {
  db.prepare('DELETE FROM posts WHERE id = ?').run(Number(ctx.params.id))
  ctx.body = { ok: true }
})

module.exports = router
