import { describe, expect, it } from 'vitest'
import { parsePostBody } from './parsePostBody'

describe('parsePostBody', () => {
  it('TC-03: splits ## headings and paragraphs', () => {
    const blocks = parsePostBody(
      '开场一段。\n\n## 第一节\n\n正文 A。\n仍同段。\n\n## 第二节\n\n正文 B。'
    )
    expect(blocks).toEqual([
      { type: 'p', text: '开场一段。' },
      { type: 'h2', text: '第一节' },
      { type: 'p', text: '正文 A。\n仍同段。' },
      { type: 'h2', text: '第二节' },
      { type: 'p', text: '正文 B。' }
    ])
  })

  it('skips empty chunks', () => {
    expect(parsePostBody('  \n\n## 标题\n\n\n')).toEqual([{ type: 'h2', text: '标题' }])
  })
})
