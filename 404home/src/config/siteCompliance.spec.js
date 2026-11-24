/**
 * ICP footer config — docs/spdd/4-测试条例/404home-icp-compliance-cases.md
 */
import { describe, expect, it } from 'vitest'
import {
  buildIcpLink,
  buildPoliceLink,
  siteCompliance
} from './siteCompliance'

describe('siteCompliance ICP', () => {
  it('TC-01: ICP config yields beian link', () => {
    const link = buildIcpLink(siteCompliance)
    expect(link).not.toBeNull()
    expect(link.href).toBe('https://beian.miit.gov.cn/')
    expect(link.text).toMatch(/ICP|备/)
    expect(link.text).toContain('2026157903')
  })

  it('TC-02: empty police number → null link', () => {
    expect(
      buildPoliceLink({
        ...siteCompliance,
        policeNumber: '',
        policeUrl: 'https://www.beian.gov.cn/'
      })
    ).toBeNull()
  })

  it('TC-03: police number set → link', () => {
    const link = buildPoliceLink({
      policeNumber: '粤公网安备00000000号',
      policeUrl: 'https://www.beian.gov.cn/portal/registerSystemInfo'
    })
    expect(link).not.toBeNull()
    expect(link.text).toContain('公网安备')
    expect(link.href).toContain('beian.gov.cn')
  })
})
