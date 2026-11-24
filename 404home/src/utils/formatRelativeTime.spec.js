/**
 * Relative time — docs/spdd/4-测试条例/404home-ux-loading-trust-cases.md TC-04
 */
import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from './formatRelativeTime'

describe('formatRelativeTime', () => {
  const now = new Date('2026-10-21T12:00:00Z')

  it('TC-04: 30s → 刚刚', () => {
    expect(formatRelativeTime('2026-10-21 11:59:30', now)).toBe('刚刚')
  })

  it('TC-04: 5min → 5 分钟前', () => {
    expect(formatRelativeTime('2026-10-21 11:55:00', now)).toBe('5 分钟前')
  })

  it('TC-04: 3h → 3 小时前', () => {
    expect(formatRelativeTime('2026-10-21 09:00:00', now)).toBe('3 小时前')
  })

  it('TC-04: 2d → 2 天前', () => {
    expect(formatRelativeTime('2026-10-19 12:00:00', now)).toBe('2 天前')
  })

  it('TC-04: 10d → YYYY-MM-DD', () => {
    expect(formatRelativeTime('2026-10-11 08:30:00', now)).toBe('2026-10-11')
  })
})
