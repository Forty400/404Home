import { describe, expect, it } from 'vitest'
import { matchPostsByQuery } from './matchPostsByQuery'

const posts = [
  { id: 1, type: 'tutorial', title: 'RAG 务实法：先检索质量', summary: '分块与去重' },
  { id: 2, type: 'news', title: '本周 Agent 升温', summary: '编程工具' },
  { id: 3, type: 'news', title: '其他', summary: '无关摘要' }
]

describe('matchPostsByQuery', () => {
  it('TC-01: matches title/summary case-insensitively and respects limit', () => {
    const hit = matchPostsByQuery(posts, 'rag', 5)
    expect(hit.map((p) => p.id)).toEqual([1])
    expect(matchPostsByQuery(posts, '编程', 5).map((p) => p.id)).toEqual([2])
    expect(matchPostsByQuery(posts, 'a', 1)).toHaveLength(1)
  })

  it('TC-02: blank query returns []', () => {
    expect(matchPostsByQuery(posts, '  ', 5)).toEqual([])
    expect(matchPostsByQuery(posts, '', 5)).toEqual([])
  })
})
