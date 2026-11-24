/**
 * Format post timestamps for list/detail UI (no seconds).
 * @param {string} raw
 * @param {Date} [now]
 */
export function formatRelativeTime(raw, now = new Date()) {
  if (!raw) return ''
  const then = parseSqliteDate(raw)
  if (Number.isNaN(then.getTime())) return String(raw).slice(0, 10)

  const diffMs = now.getTime() - then.getTime()
  if (diffMs < 60_000) return '刚刚'
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} 分钟前`
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)} 小时前`
  if (diffMs < 7 * 86_400_000) return `${Math.floor(diffMs / 86_400_000)} 天前`

  return String(raw).trim().slice(0, 10)
}

function parseSqliteDate(raw) {
  const s = String(raw).trim()
  // SQLite datetime('now') → "YYYY-MM-DD HH:MM:SS" (UTC-ish / local store)
  if (/^\d{4}-\d{2}-\d{2} /.test(s)) {
    return new Date(s.replace(' ', 'T') + 'Z')
  }
  return new Date(s)
}
