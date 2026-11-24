/**
 * Sidebar featured list: hot posts not already visible in the main feed.
 * @param {Array<{id:number,is_hot?:boolean}>} posts
 * @param {{ excludeIds?: number[], limit?: number }} [opts]
 */
export function pickFeaturedRank(posts, opts = {}) {
  const exclude = new Set((opts.excludeIds || []).map(Number))
  const limit = opts.limit ?? 8
  return (posts || [])
    .filter((p) => p && p.is_hot && !exclude.has(Number(p.id)))
    .slice(0, limit)
}
