/**
 * Minimal HTML sanitizer for admin/public preview. Not a full HTML policy engine.
 * @param {string} html
 * @returns {string}
 */
export function sanitizeHtml(html) {
  let s = String(html || '')
  s = s.replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, '')
  s = s.replace(/<\/?(script|style|iframe|object|embed)[^>]*>/gi, '')
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  s = s.replace(/javascript:/gi, '')
  s = s.replace(/data:text\/html/gi, '')
  return s
}

/** Heuristic: body looks like markup rather than ## plain text. */
export function looksLikeHtml(text) {
  return /<\/?[a-z][\s\S]*>/i.test(String(text || ''))
}
