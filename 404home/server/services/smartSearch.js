const { db, parseTool } = require('../db')
const { isConfigured } = require('./embeddings')
const { retrieveRrf } = require('./toolRetrieve')
const { rerank } = require('./toolRerank')

const TOP_N = () => Math.max(1, Number(process.env.RERANK_TOP_N || 5))

function loadTools(ids) {
  if (!ids.length) return new Map()
  const placeholders = ids.map(() => '?').join(',')
  const rows = db
    .prepare(`SELECT * FROM tools WHERE id IN (${placeholders})`)
    .all(...ids)
    .map(parseTool)
  return new Map(rows.map((t) => [t.id, t]))
}

function toItem(rank, score, reason, tool) {
  return {
    rank,
    score,
    reason,
    tool: tool
      ? {
          id: tool.id,
          name: tool.name,
          slug: tool.slug,
          summary: tool.summary,
          url: tool.url,
          tags: tool.tags || []
        }
      : null
  }
}

/**
 * @param {{ q: string, rerank?: boolean }} opts
 */
async function smartSearch(opts = {}) {
  const q = String(opts.q || '').trim()
  if (!q) {
    const err = new Error('查询不能为空')
    err.status = 400
    err.code = 'INVALID_QUERY'
    throw err
  }

  if (!isConfigured()) {
    const err = new Error('Embedding API Key 未配置')
    err.status = 503
    err.code = 'EMBEDDING_NOT_CONFIGURED'
    throw err
  }

  const chunkCount = db.prepare('SELECT COUNT(*) AS n FROM tool_chunks').get().n
  if (!chunkCount) {
    const { reindexAllTools } = require('./toolIndex')
    await reindexAllTools()
  }

  const hits = await retrieveRrf(q)
  const meta = {
    degraded: false,
    keywordHits: 0,
    vectorHits: 0,
    rrfCandidates: hits.length
  }

  // rough counts from fused list sources aren't stored; leave 0 or recompute cheaply
  const { keywordRetrieve, vectorRetrieve } = require('./toolRetrieve')
  meta.keywordHits = keywordRetrieve(q).length
  meta.vectorHits = (await vectorRetrieve(q)).length

  if (!hits.length) {
    return { items: [], meta }
  }

  const tools = loadTools(hits.map((h) => h.tool_id))
  const candidates = hits
    .map((h) => ({ ...h, tool: tools.get(h.tool_id) }))
    .filter((c) => c.tool)

  const wantRerank = opts.rerank !== false && process.env.SMART_SEARCH_RERANK !== '0'
  const topN = TOP_N()

  if (!wantRerank) {
    return {
      items: candidates.slice(0, topN).map((c, i) =>
        toItem(i + 1, c.score, '精排关闭：RRF', c.tool)
      ),
      meta: { ...meta, degraded: true }
    }
  }

  try {
    const ranked = await rerank(q, candidates)
    const byId = new Map(candidates.map((c) => [c.tool_id, c]))
    const items = ranked.items
      .map((r, i) => {
        const c = byId.get(r.tool_id)
        if (!c) return null
        return toItem(i + 1, c.score, r.reason, c.tool)
      })
      .filter(Boolean)
    return { items, meta: { ...meta, degraded: ranked.degraded } }
  } catch {
    return {
      items: candidates
        .slice(0, topN)
        .map((c, i) => toItem(i + 1, c.score, '精排降级：RRF', c.tool)),
      meta: { ...meta, degraded: true }
    }
  }
}

module.exports = { smartSearch }
