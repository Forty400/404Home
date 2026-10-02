const Router = require('koa-router')
const { db, parseTool } = require('../db')
const { authRequired } = require('../middleware/auth')

const router = new Router({ prefix: '/api/tools' })

function mapRows(rows) {
  return rows.map(parseTool)
}

router.get('/', async (ctx) => {
  const {
    q = '',
    category,
    hot,
    newest,
    enabled = '1',
    page = '1',
    pageSize = '100',
    all
  } = ctx.query

  const where = []
  const params = {}

  if (all !== '1') {
    where.push('t.enabled = @enabled')
    params.enabled = Number(enabled)
  }

  if (q) {
    where.push('(t.name LIKE @q OR t.summary LIKE @q OR t.tags LIKE @q)')
    params.q = `%${q}%`
  }
  if (category) {
    where.push('(c.slug = @category OR c.id = @categoryId)')
    params.category = category
    params.categoryId = Number(category) || -1
  }
  if (hot === '1') where.push('t.is_hot = 1')
  if (newest === '1') where.push('t.is_new = 1')

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const limit = Math.min(Number(pageSize) || 100, 200)
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit

  const listSql = `
    SELECT t.*, c.name AS category_name, c.slug AS category_slug
    FROM tools t
    LEFT JOIN categories c ON c.id = t.category_id
    ${whereSql}
    ORDER BY t.sort ASC, t.id DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  const countSql = `
    SELECT COUNT(*) AS total
    FROM tools t
    LEFT JOIN categories c ON c.id = t.category_id
    ${whereSql}
  `

  const total = db.prepare(countSql).get(params).total
  const items = mapRows(db.prepare(listSql).all(params))
  ctx.body = { items, total, page: Number(page) || 1, pageSize: limit }
})

router.get('/grouped', async (ctx) => {
  const categories = db
    .prepare('SELECT * FROM categories ORDER BY sort ASC, id ASC')
    .all()
  const tools = mapRows(
    db
      .prepare(
        `SELECT t.*, c.name AS category_name, c.slug AS category_slug
         FROM tools t
         LEFT JOIN categories c ON c.id = t.category_id
         WHERE t.enabled = 1
         ORDER BY t.sort ASC, t.id DESC`
      )
      .all()
  )
  const grouped = categories.map((cat) => ({
    ...cat,
    tools: tools.filter((t) => t.category_id === cat.id).slice(0, 12)
  }))
  ctx.body = grouped
})

router.get('/:idOrSlug', async (ctx) => {
  const key = ctx.params.idOrSlug
  const row = Number.isInteger(Number(key)) && String(Number(key)) === key
    ? db
        .prepare(
          `SELECT t.*, c.name AS category_name, c.slug AS category_slug
           FROM tools t LEFT JOIN categories c ON c.id = t.category_id
           WHERE t.id = ?`
        )
        .get(Number(key))
    : db
        .prepare(
          `SELECT t.*, c.name AS category_name, c.slug AS category_slug
           FROM tools t LEFT JOIN categories c ON c.id = t.category_id
           WHERE t.slug = ?`
        )
        .get(key)

  if (!row) {
    ctx.status = 404
    ctx.body = { error: '工具不存在' }
    return
  }
  ctx.body = parseTool(row)
})

router.post('/', authRequired, async (ctx) => {
  const body = ctx.request.body || {}
  const {
    name,
    slug,
    summary = '',
    url = '',
    icon = '',
    category_id = null,
    tags = [],
    is_hot = false,
    is_new = false,
    enabled = true,
    sort = 0
  } = body

  if (!name || !slug) {
    ctx.status = 400
    ctx.body = { error: '名称和 slug 必填' }
    return
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO tools
        (name, slug, summary, url, icon, category_id, tags, is_hot, is_new, enabled, sort)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name,
        slug,
        summary,
        url,
        icon,
        category_id,
        JSON.stringify(tags || []),
        is_hot ? 1 : 0,
        is_new ? 1 : 0,
        enabled ? 1 : 0,
        sort
      )
    const row = db
      .prepare(
        `SELECT t.*, c.name AS category_name, c.slug AS category_slug
         FROM tools t LEFT JOIN categories c ON c.id = t.category_id
         WHERE t.id = ?`
      )
      .get(result.lastInsertRowid)
    ctx.body = parseTool(row)
  } catch (e) {
    ctx.status = 400
    ctx.body = { error: e.message.includes('UNIQUE') ? 'slug 已存在' : e.message }
  }
})

router.put('/:id', authRequired, async (ctx) => {
  const id = Number(ctx.params.id)
  const existing = db.prepare('SELECT * FROM tools WHERE id = ?').get(id)
  if (!existing) {
    ctx.status = 404
    ctx.body = { error: '工具不存在' }
    return
  }
  const body = ctx.request.body || {}
  const next = {
    name: body.name ?? existing.name,
    slug: body.slug ?? existing.slug,
    summary: body.summary ?? existing.summary,
    url: body.url ?? existing.url,
    icon: body.icon ?? existing.icon,
    category_id: body.category_id !== undefined ? body.category_id : existing.category_id,
    tags: body.tags !== undefined ? JSON.stringify(body.tags) : existing.tags,
    is_hot: body.is_hot !== undefined ? (body.is_hot ? 1 : 0) : existing.is_hot,
    is_new: body.is_new !== undefined ? (body.is_new ? 1 : 0) : existing.is_new,
    enabled: body.enabled !== undefined ? (body.enabled ? 1 : 0) : existing.enabled,
    sort: body.sort !== undefined ? body.sort : existing.sort
  }
  try {
    db.prepare(
      `UPDATE tools SET name=?, slug=?, summary=?, url=?, icon=?, category_id=?,
       tags=?, is_hot=?, is_new=?, enabled=?, sort=? WHERE id=?`
    ).run(
      next.name,
      next.slug,
      next.summary,
      next.url,
      next.icon,
      next.category_id,
      next.tags,
      next.is_hot,
      next.is_new,
      next.enabled,
      next.sort,
      id
    )
    const row = db
      .prepare(
        `SELECT t.*, c.name AS category_name, c.slug AS category_slug
         FROM tools t LEFT JOIN categories c ON c.id = t.category_id
         WHERE t.id = ?`
      )
      .get(id)
    ctx.body = parseTool(row)
  } catch (e) {
    ctx.status = 400
    ctx.body = { error: e.message.includes('UNIQUE') ? 'slug 已存在' : e.message }
  }
})

router.delete('/:id', authRequired, async (ctx) => {
  db.prepare('DELETE FROM tools WHERE id = ?').run(Number(ctx.params.id))
  ctx.body = { ok: true }
})

module.exports = router
