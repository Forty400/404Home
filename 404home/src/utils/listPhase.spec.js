/**
 * UX loading/empty — docs/spdd/4-测试条例/404home-ux-loading-trust-cases.md TC-01…03
 */
import { describe, expect, it } from 'vitest'
import { listPhase } from './listPhase'

describe('listPhase', () => {
  it('TC-01: loading + empty length → loading', () => {
    expect(listPhase(true, 0)).toBe('loading')
  })

  it('TC-02: !loading + length 0 → empty', () => {
    expect(listPhase(false, 0)).toBe('empty')
  })

  it('TC-03: !loading + length > 0 → ready', () => {
    expect(listPhase(false, 3)).toBe('ready')
  })
})
