import { api } from '@/api'

const VISITOR_KEY = '404home_visitor_id'

function visitorId() {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

/** Fire-and-forget page view for delivery analytics */
export function trackPageview(fullPath) {
  const path = String(fullPath || '/').split('?')[0] || '/'
  if (path.startsWith('/admin')) return
  api.trackPageview({ path, visitorId: visitorId() }).catch(() => {})
}
