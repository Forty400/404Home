/**
 * Maps to docs/spdd/4-测试条例/404home-auth-cases.md TC-06 / TC-06b / TC-07
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { useLoginCache } from './useLoginCache'

const { load, save, clear, CACHE_KEY } = useLoginCache()

describe('useLoginCache', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('TC-06: save stores email only (no password field)', () => {
    save('a@example.com')
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY))
    expect(raw).toEqual({ email: 'a@example.com' })
    expect(raw).not.toHaveProperty('password')
    expect(load()).toEqual({ email: 'a@example.com' })
  })

  it('TC-07: clear removes cache', () => {
    save('a@example.com')
    clear()
    expect(localStorage.getItem(CACHE_KEY)).toBeNull()
    expect(load()).toBeNull()
  })

  it('TC-06b: legacy cache with password is stripped on load', () => {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ email: 'old@example.com', password: 'secret' })
    )
    const loaded = load()
    expect(loaded).toEqual({ email: 'old@example.com' })
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY))
    expect(raw).toEqual({ email: 'old@example.com' })
    expect(raw).not.toHaveProperty('password')
  })
})
