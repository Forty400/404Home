/**
 * Light post body: ## headings + blank-line paragraphs. Not full Markdown.
 * @param {string} text
 * @returns {Array<{ type: 'h2'|'p', text: string }>}
 */
export function parsePostBody(text) {
  const raw = String(text || '')
  if (!raw.trim()) return []
  const chunks = raw.split(/\n\s*\n/)
  const blocks = []
  for (const chunk of chunks) {
    const trimmed = chunk.trim()
    if (!trimmed) continue
    const heading = trimmed.match(/^##\s+(.+)$/s)
    if (heading) {
      const title = heading[1].trim()
      if (title) blocks.push({ type: 'h2', text: title })
      continue
    }
    blocks.push({ type: 'p', text: trimmed })
  }
  return blocks
}
