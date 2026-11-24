/**
 * Split a tools row into field-level chunks for retrieval.
 */
function parseTags(tags) {
  if (Array.isArray(tags)) return tags
  try {
    const v = JSON.parse(tags || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function chunkTool(tool) {
  if (!tool || tool.id == null) return []
  const tags = parseTags(tool.tags)
  const out = []
  const push = (field, text) => {
    const t = String(text || '').trim()
    if (!t) return
    out.push({ tool_id: tool.id, field, text: t.slice(0, 1000) })
  }

  push('name', tool.name)
  push('summary', tool.summary)
  if (tags.length) push('tags', tags.join(' '))
  push('scenario', tool.scenario)
  const tagStr = tags.join(',')
  push('card', `${tool.name || ''}。${tool.summary || ''}。标签:${tagStr}`)
  return out
}

module.exports = { chunkTool, parseTags }
