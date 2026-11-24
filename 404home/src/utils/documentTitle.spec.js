import { describe, expect, it } from 'vitest'
import { resolveDocumentTitle } from './documentTitle'
import fs from 'node:fs'
import path from 'node:path'

describe('resolveDocumentTitle', () => {
  it('TC-04: uses meta.title and site suffix', () => {
    expect(resolveDocumentTitle({ name: 'news', meta: { title: '每日资讯' } })).toBe(
      '每日资讯 · 404Home'
    )
    expect(resolveDocumentTitle({ name: 'trial', meta: { title: 'DeepSeek 试用' } })).toBe(
      'DeepSeek 试用 · 404Home'
    )
    expect(resolveDocumentTitle({ name: 'home', meta: { title: 'AI 内容站' } })).toBe(
      'AI 内容站 · 404Home'
    )
  })

  it('TC-04b: fallback when meta missing', () => {
    expect(resolveDocumentTitle({ name: 'category', meta: {} })).toMatch(/404Home$/)
  })
})

describe('Home hero copy', () => {
  it('TC-05: no instruction-manual lead; has trial affordance', () => {
    const file = path.join(__dirname, '../views/Home.vue')
    const src = fs.readFileSync(file, 'utf8')
    expect(src).not.toMatch(/先读热门文章/)
    expect(src).toMatch(/试用|\/trial/)
  })
})
