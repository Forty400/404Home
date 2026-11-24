/**
 * Same-topic posts for detail page, excluding current.
 * @param {Array<{id:number,topic?:string}>} posts
 * @param {{ excludeId: number, topic: string, limit?: number }} opts
 */
export function pickRelatedPosts(posts, opts) {
  const excludeId = Number(opts.excludeId)
  const topic = opts.topic
  const limit = opts.limit ?? 3
  return (posts || [])
    .filter((p) => p && Number(p.id) !== excludeId && p.topic === topic)
    .slice(0, limit)
}
