const Router = require('koa-router')
const { db, parsePost } = require('../db')
const { authRequired } = require('../middleware/auth')

const router = new Router({ prefix: '/api/posts' })

const TOPICS = new Set(['plugin', 'dev', 'method', 'news'])

function normalizeTopic(topic, type) {
  if (topic && TOPICS.has(topic)) return topic
  return type === 'tutorial' ? 'method' : 'news'
}

router.get('/', async (ctx) => {
  const { type, topic, hot, all } = ctx.query
  const where = []
  const params = {}
  if (type) {
    where.push('type = @type')
    params.type = type
  }
  if (topic) {
    where.push('topic = @topic')
    params.topic = topic
  }
  if (hot === '1') {
    where.push('is_hot = 1')
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
    source_name = '',
    source_url = '',
    published = true,
    is_hot = false
  } = body
  if (!title || !['news', 'tutorial'].includes(type)) {
    ctx.status = 400
    ctx.body = { error: '标题必填，且 type 须为 news 或 tutorial' }
    return
  }
  if (body.topic !== undefined && body.topic !== '' && !TOPICS.has(body.topic)) {
    ctx.status = 400
    ctx.body = { error: 'topic 须为 plugin、dev、method 或 news' }
    return
  }
  const topic = normalizeTopic(body.topic, type)
  const result = db
    .prepare(
      `INSERT INTO posts (type, title, summary, content, cover, topic, source_name, source_url, is_hot, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      type,
      title,
      summary,
      content,
      cover,
      topic,
      source_name,
      source_url,
      is_hot ? 1 : 0,
      published ? 1 : 0
    )
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
  if (body.topic !== undefined && body.topic !== '' && !TOPICS.has(body.topic)) {
    ctx.status = 400
    ctx.body = { error: 'topic 须为 plugin、dev、method 或 news' }
    return
  }
  const next = {
    type: body.type ?? existing.type,
    title: body.title ?? existing.title,
    summary: body.summary ?? existing.summary,
    content: body.content ?? existing.content,
    cover: body.cover ?? existing.cover,
    topic: body.topic !== undefined ? normalizeTopic(body.topic, body.type ?? existing.type) : existing.topic,
    source_name: body.source_name ?? existing.source_name,
    source_url: body.source_url ?? existing.source_url,
    is_hot: body.is_hot !== undefined ? (body.is_hot ? 1 : 0) : existing.is_hot,
    published: body.published !== undefined ? (body.published ? 1 : 0) : existing.published
  }
  if (!['news', 'tutorial'].includes(next.type)) {
    ctx.status = 400
    ctx.body = { error: 'type 须为 news 或 tutorial' }
    return
  }
  db.prepare(
    `UPDATE posts SET type=?, title=?, summary=?, content=?, cover=?, topic=?, source_name=?, source_url=?, is_hot=?, published=? WHERE id=?`
  ).run(
    next.type,
    next.title,
    next.summary,
    next.content,
    next.cover,
    next.topic,
    next.source_name,
    next.source_url,
    next.is_hot,
    next.published,
    id
  )
  ctx.body = parsePost(db.prepare('SELECT * FROM posts WHERE id = ?').get(id))
})

router.delete('/:id', authRequired, async (ctx) => {
  db.prepare('DELETE FROM posts WHERE id = ?').run(Number(ctx.params.id))
  ctx.body = { ok: true }
})

module.exports = router
