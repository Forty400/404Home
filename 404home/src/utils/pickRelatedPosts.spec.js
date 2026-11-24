import { describe, expect, it } from 'vitest'
import { pickRelatedPosts } from './pickRelatedPosts'

describe('pickRelatedPosts', () => {
  it('TC-04: same topic, exclude self, limit', () => {
    const list = [
      { id: 1, topic: 'method', title: 'A' },
      { id: 2, topic: 'method', title: 'B' },
      { id: 3, topic: 'method', title: 'C' },
      { id: 4, topic: 'method', title: 'D' },
      { id: 5, topic: 'news', title: 'N' }
    ]
    const got = pickRelatedPosts(list, { excludeId: 2, topic: 'method', limit: 3 })
    expect(got.map((p) => p.id)).toEqual([1, 3, 4])
    expect(got.every((p) => p.topic === 'method')).toBe(true)
    expect(got.find((p) => p.id === 2)).toBeUndefined()
  })
})
