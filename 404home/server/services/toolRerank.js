const deepseek = require('./deepseek')

const TOP_N = () => Math.max(1, Number(process.env.RERANK_TOP_N || 5))

/**
 * @param {string} query
 * @param {Array<{tool_id:number, score:number, tool:object}>} candidates
 */
async function rerank(query, candidates) {
  const topN = TOP_N()
  const pool = (candidates || []).slice(0, 40)
  if (!pool.length) return { items: [], degraded: false }

  if (process.env.SMART_SEARCH_RERANK_FAIL === '1') {
    const err = new Error('forced rerank fail')
    err.code = 'RERANK_FAIL'
    throw err
  }

  if (process.env.DEEPSEEK_STUB === '1') {
    return {
      items: pool.slice(0, topN).map((c) => ({
        tool_id: c.tool_id,
        reason: `stub: 与「${query}」相关（${c.tool?.name || c.tool_id}）`
      })),
      degraded: false
    }
  }

  const lines = pool.map((c, i) => {
    const t = c.tool || {}
    return `${i + 1}. id=${c.tool_id} name=${t.name || ''} summary=${(t.summary || '').slice(0, 120)} tags=${JSON.stringify(t.tags || [])}`
  })

  const messages = [
    {
      role: 'system',
      content:
        '你是工具检索精排器。只输出 JSON 数组，长度≤5，元素形如 {"tool_id":number,"reason":string}。只能引用候选里的 id。不要 markdown。'
    },
    {
      role: 'user',
      content: `用户查询：${query}\n候选：\n${lines.join('\n')}\n请精排输出 top-5 JSON 数组。`
    }
  ]

  const res = await deepseek.chatCompletions(messages)
  const parsed = parseJsonArray(res.content)
  if (!parsed) {
    const err = new Error('rerank JSON parse failed')
    err.code = 'RERANK_PARSE'
    throw err
  }

  const allowed = new Set(pool.map((c) => c.tool_id))
  const items = []
  for (const row of parsed) {
    const id = Number(row.tool_id)
    if (!allowed.has(id)) continue
    const reason = String(row.reason || '').trim() || '精排命中'
    items.push({ tool_id: id, reason })
    if (items.length >= topN) break
  }
  if (!items.length) {
    const err = new Error('rerank empty after filter')
    err.code = 'RERANK_EMPTY'
    throw err
  }
  return { items, degraded: false }
}

function parseJsonArray(text) {
  const s = String(text || '').trim()
  const start = s.indexOf('[')
  const end = s.lastIndexOf(']')
  if (start < 0 || end < start) return null
  try {
    const v = JSON.parse(s.slice(start, end + 1))
    return Array.isArray(v) ? v : null
  } catch {
    return null
  }
}

module.exports = { rerank, parseJsonArray }
