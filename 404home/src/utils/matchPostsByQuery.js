/**
 * Filter published-shaped posts by keyword in title/summary (tools search companion).
 * @param {Array<{ id: number, title?: string, summary?: string }>} posts
 * @param {string} q
 * @param {number} [limit=5]
 */
export function matchPostsByQuery(posts, q, limit = 5) {
  const needle = String(q || '')
    .trim()
    .toLowerCase()
  if (!needle || !Array.isArray(posts) || limit <= 0) return []
  const out = []
  for (const p of posts) {
    const hay = `${p.title || ''} ${p.summary || ''}`.toLowerCase()
    if (!hay.includes(needle)) continue
    out.push(p)
    if (out.length >= limit) break
  }
  return out
}
