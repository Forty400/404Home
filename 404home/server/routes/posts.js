const Router = require('koa-router')
const {
  db,
  parsePost,
  POST_LIFECYCLES,
  pendingReviewLimit,
  countPendingReview,
  setPostLifecycle
} = require('../db')
const { authRequired, getToken, isAdminPayload } = require('../middleware/auth')
const jwt = require('jsonwebtoken')

const router = new Router({ prefix: '/api/posts' })

const TOPICS = new Set(['plugin', 'dev', 'method', 'news'])

function normalizeTopic(topic, type) {
  if (topic && TOPICS.has(topic)) return topic
  return type === 'tutorial' ? 'method' : 'news'
}

function resolveLifecycle(body, { forIngest = false } = {}) {
  if (body.lifecycle && POST_LIFECYCLES.has(body.lifecycle)) return body.lifecycle
  if (forIngest || body.ingest) return 'pending_review'
  if (body.published === false || body.published === 0) return 'draft'
  if (body.published === true || body.published === 1) return 'published'
  return 'draft'
}

function tryAdmin(ctx) {
  const token = getToken(ctx)
  if (!token) return false
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    return isAdminPayload(payload)
  } catch {
    return false
  }
}

router.get('/', async (ctx) => {
  const { type, topic, hot, all, lifecycle } = ctx.query
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
  const admin = all === '1' && tryAdmin(ctx)
  if (admin) {
    if (lifecycle && POST_LIFECYCLES.has(lifecycle)) {
      where.push('lifecycle = @lifecycle')
      params.lifecycle = lifecycle
    }
  } else {
    where.push(`lifecycle = 'published'`)
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
  const post = parsePost(row)
  if (post.lifecycle !== 'published' && !tryAdmin(ctx)) {
    ctx.status = 404
    ctx.body = { error: '文章不存在' }
    return
  }
  ctx.body = post
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
    is_hot = false,
    ingest_bot = ''
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
  const forIngest = !!(body.ingest || body.lifecycle === 'pending_review')
  const lifecycle = resolveLifecycle(body, { forIngest })
  if (!POST_LIFECYCLES.has(lifecycle)) {
    ctx.status = 400
    ctx.body = { error: '非法 lifecycle' }
    return
  }
  if (lifecycle === 'pending_review') {
    const limit = pendingReviewLimit()
    if (countPendingReview() >= limit) {
      ctx.status = 429
      ctx.body = {
        error: `待审已满（≥${limit}），暂停采集入库`,
        code: 'pending_backlog_full'
      }
      return
    }
    if (source_url) {
      const dup = db
        .prepare(
          `SELECT id FROM posts WHERE source_url = ? AND lifecycle IN ('pending_review','draft','published') LIMIT 1`
        )
        .get(source_url)
      if (dup) {
        ctx.status = 409
        ctx.body = { error: '相同出处已存在', code: 'duplicate_source_url', id: dup.id }
        return
      }
    }
  }
  const published = lifecycle === 'published' ? 1 : 0
  const result = db
    .prepare(
      `INSERT INTO posts (type, title, summary, content, cover, topic, source_name, source_url, is_hot, published, lifecycle, ingest_bot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      published,
      lifecycle,
      ingest_bot || ''
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
  let lifecycle = existing.lifecycle || (existing.published ? 'published' : 'draft')
  if (body.lifecycle !== undefined) {
    if (!POST_LIFECYCLES.has(body.lifecycle)) {
      ctx.status = 400
      ctx.body = { error: '非法 lifecycle' }
      return
    }
    lifecycle = body.lifecycle
  } else if (body.published !== undefined) {
    lifecycle = body.published ? 'published' : lifecycle === 'published' ? 'draft' : lifecycle
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
    published: lifecycle === 'published' ? 1 : 0,
    lifecycle,
    ingest_bot: body.ingest_bot !== undefined ? body.ingest_bot : existing.ingest_bot || ''
  }
  if (!['news', 'tutorial'].includes(next.type)) {
    ctx.status = 400
    ctx.body = { error: 'type 须为 news 或 tutorial' }
    return
  }
  db.prepare(
    `UPDATE posts SET type=?, title=?, summary=?, content=?, cover=?, topic=?, source_name=?, source_url=?, is_hot=?, published=?, lifecycle=?, ingest_bot=? WHERE id=?`
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
    next.lifecycle,
    next.ingest_bot,
    id
  )
  ctx.body = parsePost(db.prepare('SELECT * FROM posts WHERE id = ?').get(id))
})

async function loadPostOr404(ctx) {
  const id = Number(ctx.params.id)
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id)
  if (!row) {
    ctx.status = 404
    ctx.body = { error: '文章不存在' }
    return null
  }
  return { id, row }
}

router.post('/:id/approve', authRequired, async (ctx) => {
  const hit = await loadPostOr404(ctx)
  if (!hit) return
  ctx.body = setPostLifecycle(hit.id, 'draft')
})

router.post('/:id/publish', authRequired, async (ctx) => {
  const hit = await loadPostOr404(ctx)
  if (!hit) return
  ctx.body = setPostLifecycle(hit.id, 'published')
})

router.post('/:id/archive', authRequired, async (ctx) => {
  const hit = await loadPostOr404(ctx)
  if (!hit) return
  ctx.body = setPostLifecycle(hit.id, 'archived')
})

router.post('/:id/restore', authRequired, async (ctx) => {
  const hit = await loadPostOr404(ctx)
  if (!hit) return
  ctx.body = setPostLifecycle(hit.id, 'draft')
})

router.post('/:id/fork', authRequired, async (ctx) => {
  const hit = await loadPostOr404(ctx)
  if (!hit) return
  const src = hit.row
  const title = String(src.title || '').includes('副本') ? src.title : `${src.title}（副本）`
  const result = db
    .prepare(
      `INSERT INTO posts (type, title, summary, content, cover, topic, source_name, source_url, is_hot, published, lifecycle, ingest_bot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'draft', ?)`
    )
    .run(
      src.type,
      title,
      src.summary,
      src.content,
      src.cover,
      src.topic,
      src.source_name,
      src.source_url,
      src.ingest_bot || ''
    )
  ctx.body = parsePost(db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid))
})

router.delete('/:id', authRequired, async (ctx) => {
  db.prepare('DELETE FROM posts WHERE id = ?').run(Number(ctx.params.id))
  ctx.body = { ok: true }
})

module.exports = router
