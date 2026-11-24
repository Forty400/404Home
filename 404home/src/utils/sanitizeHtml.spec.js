import { describe, it, expect } from 'vitest'
import { sanitizeHtml, looksLikeHtml } from './sanitizeHtml'

describe('sanitizeHtml', () => {
  it('TC-10: strips script and onclick', () => {
    const dirty = `<p onclick="alert(1)">hi</p><script>evil()</script><img src="x" onerror="x">`
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toMatch(/script/i)
    expect(clean).not.toMatch(/onclick/i)
    expect(clean).not.toMatch(/onerror/i)
    expect(clean).toMatch(/hi/)
  })

  it('looksLikeHtml detects tags', () => {
    expect(looksLikeHtml('<p>a</p>')).toBe(true)
    expect(looksLikeHtml('## 标题\n\n段落')).toBe(false)
  })
})
