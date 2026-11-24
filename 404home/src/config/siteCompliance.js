/**
 * 站点合规展示（ICP / 公安联网备案）。
 * 公安号通过前保持 policeNumber 为空；勿把证件等材料写入本文件。
 */
export const siteCompliance = {
  icpNumber: '粤ICP备2026157903号',
  icpUrl: 'https://beian.miit.gov.cn/',
  policeNumber: '',
  policeUrl: ''
}

export function buildIcpLink(cfg = siteCompliance) {
  const text = String(cfg.icpNumber || '').trim()
  const href = String(cfg.icpUrl || '').trim()
  if (!text || !href) return null
  return { text, href }
}

export function buildPoliceLink(cfg = siteCompliance) {
  const text = String(cfg.policeNumber || '').trim()
  const href = String(cfg.policeUrl || '').trim()
  if (!text || !href) return null
  return { text, href }
}
