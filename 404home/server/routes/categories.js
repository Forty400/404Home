const Router = require('koa-router')
const { db } = require('../db')
const { authRequired } = require('../middleware/auth')

const router = new Router({ prefix: '/api/categories' })

router.get('/', async (ctx) => {
  const rows = db
    .prepare('SELECT * FROM categories ORDER BY sort ASC, id ASC')
    .all()
  ctx.body = rows
})

router.get('/:slug', async (ctx) => {
  const row = db.prepare('SELECT * FROM categories WHERE slug = ?').get(ctx.params.slug)
  if (!row) {
    ctx.status = 404
    ctx.body = { error: '分类不存在' }
    return
  }
  ctx.body = row
})

router.post('/', authRequired, async (ctx) => {
  const { name, slug, parent_id = null, sort = 0, icon = '' } = ctx.request.body || {}
  if (!name || !slug) {
    ctx.status = 400
    ctx.body = { error: '名称和 slug 必填' }
    return
  }
  try {
    const result = db
      .prepare(
        'INSERT INTO categories (name, slug, parent_id, sort, icon) VALUES (?, ?, ?, ?, ?)'
      )
      .run(name, slug, parent_id, sort, icon)
    ctx.body = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)
  } catch (e) {
    ctx.status = 400
    ctx.body = { error: e.message.includes('UNIQUE') ? 'slug 已存在' : e.message }
  }
})

router.put('/:id', authRequired, async (ctx) => {
  const id = Number(ctx.params.id)
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(id)
  if (!existing) {
    ctx.status = 404
    ctx.body = { error: '分类不存在' }
    return
  }
  const body = ctx.request.body || {}
  const name = body.name ?? existing.name
  const slug = body.slug ?? existing.slug
  const parent_id = body.parent_id !== undefined ? body.parent_id : existing.parent_id
  const sort = body.sort !== undefined ? body.sort : existing.sort
  const icon = body.icon !== undefined ? body.icon : existing.icon
  try {
    db.prepare(
      'UPDATE categories SET name=?, slug=?, parent_id=?, sort=?, icon=? WHERE id=?'
    ).run(name, slug, parent_id, sort, icon, id)
    ctx.body = db.prepare('SELECT * FROM categories WHERE id = ?').get(id)
  } catch (e) {
    ctx.status = 400
    ctx.body = { error: e.message.includes('UNIQUE') ? 'slug 已存在' : e.message }
  }
})

router.delete('/:id', authRequired, async (ctx) => {
  const id = Number(ctx.params.id)
  db.prepare('DELETE FROM categories WHERE id = ?').run(id)
  ctx.body = { ok: true }
})

module.exports = router
