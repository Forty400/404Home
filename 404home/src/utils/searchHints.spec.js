/**
 * Search hints — docs/spdd/4-测试条例/404home-ux-week-bc-cases.md TC-02
 */
import { describe, expect, it } from 'vitest'
import { SEARCH_HINTS } from './searchHints'

describe('SEARCH_HINTS', () => {
  it('TC-02: has enough clickable tool keywords including PPT', () => {
    expect(SEARCH_HINTS.length).toBeGreaterThanOrEqual(3)
    expect(SEARCH_HINTS).toContain('PPT')
  })
})
