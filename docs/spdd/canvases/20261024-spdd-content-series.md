# REASONS Canvas · SPDD 内容系列 + 阅读小优化

- Date: 2026-10-24
- Status: synced
- Related analysis: `docs/spdd/analysis/20261021-forty40-ux-review.md`
- Related ADR: `docs/spdd/2-adr决策/ADR-20261024-spdd-content-series.md`
- Related tests: `3-测试边界/404home-spdd-content.md` · `4-测试条例/404home-spdd-content-cases.md`
- Code anchors: `404home/server/seed.js`、`404home/src/views/PostDetail.vue`、`404home/src/views/About.vue`、`404home/src/utils/parsePostBody.js`、`404home/src/utils/pickRelatedPosts.js`

---

## R · Requirements

### Business goal

用现有热门文章 UX，首发可传播的 SPDD 方法论长文，并让详情页/ About 配得上「内容站」叙事。

### In scope

- seed ≥2 篇 SPDD 系列（规划手册、仓库 SPDD 化）
- 热门配额优先新稿（id DESC）
- PostDetail：`##`/段落块 + 同 topic 相关推荐
- About 叙事对齐 Feed + 试用（UX-35）

### Out of scope

- 全 Markdown、评论、UGC、爬虫、UX-31

### Acceptance criteria

- [x] seed 后存在两篇目标标题；method 热门 ≤3 且含至少一篇新标题为 hot
- [x] `parsePostBody` / `pickRelatedPosts` 单测绿
- [x] About 文案含「文章」与「试用」语义
- [x] P0 `spdd-content-p0` + 既有 hot/ux-week-bc 绿

---

## E · Entities

| Entity | Meaning |
| --- | --- |
| SpddArticle | seed 教程稿，topic=method |
| PostBodyBlock | `{ type: 'h2'\|'p', text }` |
| RelatedPosts | 同 topic、排除当前 id |

---

## A · Approach

1. 内容进 `HOT_ARTICLES`；`ensureHotArticles` 按 title 幂等插入。
2. `capHotArticles`：`ORDER BY id DESC`。
3. 纯函数解析/推荐 + Vitest；PostDetail 薄接线。
4. About 改三段文案，无新依赖。

---

## S · Structure

| Path | Change |
| --- | --- |
| ADR / 边界 / 条例 / 本画布 | 本轮 |
| `server/seed.js` | 两篇长文 + cap 排序 |
| `server/test/spdd-content-p0.test.js` | P0 |
| `src/utils/parsePostBody.js` + spec | 正文块 |
| `src/utils/pickRelatedPosts.js` + spec | 相关文 |
| `PostDetail.vue` · `About.vue` | UI |
| UX 看板 UX-35 | done |

---

## O · Operations

### Op 1 · 资产与红测

- **Done when**: 条例对应用例先失败

### Op 2 · seed + cap + 工具函数 + UI

- **Done when**: 验收点 + 自动化绿

### Op 3 · 画布 synced / 看板勾选

- **Done when**: Status synced；UX-35 done

---

## N · Norms

- 出处写清本仓库/公开概念；禁止无出处「伪转载」
- 新功能优先复用 `listPhase` / `ArticleCard` 既有模式；无新 npm 依赖
- 正文 `##` 仅为展示约定，不引入 markdown 库

---

## S · Safeguards

- Must not: 破坏每 topic 热门 ≤3；把 Trial 从首页/Header 拿掉
- Must not: 前端硬编码文章列表（相关文走 API）
- Must not: 把密钥或 deploy.local 写进正文

---

## Sync log

| Date | Action |
| --- | --- |
| 2026-10-24 | active |
| 2026-10-24 | 首发两篇 + 阅读 UX + About | synced |
