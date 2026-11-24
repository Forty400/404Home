# 测试条例 · UX Sprint A（闭环）

- Status: active
- Related boundary: `docs/spdd/3-测试边界/404home-ux-sprint-a-loops.md`
- Related canvas: `docs/spdd/canvases/20261021-ux-sprint-a-loops.md`
- Code tests: `404home/src/utils/matchPostsByQuery.spec.js` · `404home/server/test/ux-sprint-a-p0.test.js`
- Updated: 2026-11-25

## Cases

### TC-01 · 文章关键词匹配

- Priority: P0
- **Given**: posts 含 title「RAG 务实法…」与无关篇
- **When**: `matchPostsByQuery(posts, 'rag', 5)`
- **Then**: 命中 RAG 篇；长度 ≤5；不命中无关篇

### TC-02 · 空词不匹配

- Priority: P0
- **Given**: 任意 posts
- **When**: `matchPostsByQuery(posts, '  ', 5)`
- **Then**: `[]`

### TC-03 · 无连续重复 BODY_PAD、无句号灌水

- Priority: P0
- **Given**: seed 后已发布 posts
- **When**: 检查 `content`
- **Then**: 无连续两段相同 `BODY_PAD`；无连续 ≥5 个中文句号 `。`

### TC-04 · Trial 文案无「充值」（源码）

- Priority: P0
- **Given**: `Trial.vue` 与 `useTrialChat.js` 源文件
- **When**: 扫描用户可见余额相关文案字符串
- **Then**: 不含「充值」

## Traceability

| Case | UX |
| --- | --- |
| TC-01/02 | UX-21 |
| TC-03 | UX-23 |
| TC-04 | UX-22 |
| （手测 AuthModal CTA） | UX-24 |
