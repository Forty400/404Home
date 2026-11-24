/**
 * Featured rank dedupe — docs/spdd/4-测试条例/404home-ux-week-bc-cases.md TC-01
 */
import { describe, expect, it } from 'vitest'
import { pickFeaturedRank } from './pickFeaturedRank'

describe('pickFeaturedRank', () => {
  it('TC-01: excludes feed ids and keeps hot others', () => {
    const posts = [
      { id: 1, is_hot: true, title: 'a' },
      { id: 2, is_hot: true, title: 'b' },
      { id: 3, is_hot: true, title: 'c' },
      { id: 4, is_hot: false, title: 'd' },
      { id: 5, is_hot: true, title: 'e' }
    ]
    const rank = pickFeaturedRank(posts, { excludeIds: [1, 2, 3], limit: 5 })
    expect(rank.map((p) => p.id)).toEqual([5])
    expect(rank.every((p) => ![1, 2, 3].includes(p.id))).toBe(true)
    expect(rank.length).toBeLessThanOrEqual(5)
  })
})
