import { describe, expect, it } from 'vitest'
import { shouldShowCategoryNav } from './shouldShowCategoryNav'

describe('shouldShowCategoryNav', () => {
  it('TC-01: tool discovery routes show bar when menu closed', () => {
    for (const name of ['home', 'category', 'search', 'tool-detail']) {
      expect(shouldShowCategoryNav(name, { navOpen: false })).toBe(true)
    }
  })

  it('TC-02: content / trial routes hide bar', () => {
    for (const name of [
      'news',
      'news-detail',
      'tutorials',
      'tutorial-detail',
      'about',
      'trial'
    ]) {
      expect(shouldShowCategoryNav(name, { navOpen: false })).toBe(false)
    }
  })

  it('TC-03: hamburger open forces hide even on home', () => {
    expect(shouldShowCategoryNav('home', { navOpen: true })).toBe(false)
  })
})
