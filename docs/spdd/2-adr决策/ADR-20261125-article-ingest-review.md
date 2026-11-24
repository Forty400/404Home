# ADR-20261125 · 静默采集 + 审稿生命周期 + 回收站

- Status: accepted
- Date: 2026-11-25
- Deciders: user（定稿）+ AI
- Related canvas: `docs/spdd/canvases/20261125-article-ingest-review.md`
- Related analysis: `docs/spdd/analysis/20261125-article-ingest-review.md`
- Partially supersedes: `ADR-20261021-hot-articles-home` §4「不做定时爬虫」→ 允许**静默只读**定时采集进待审（仍禁止未审自动上线、禁止源站互动）

## Context

首页依赖 seed/手工录入，素材供给慢。编辑需要机器帮忙抓公开资讯与 GitHub 方法论整理稿进待审，人工审过后再手动发布；并要上下线/回收站/硬删清理过期文。须避免待审压满、源站扰民、未审上首页。

## Decision

1. **`posts.lifecycle`**：`pending_review | draft | published | archived` 为展示与权限真源；`published` 整型与之同步（仅 `lifecycle=published` 时为 1），兼容旧查询。
2. **审过 ≠ 上线**：approve → `draft`；publish 才 → `published`；下线 → `archived`；restore → `draft`；DELETE 硬删。
3. **另存副本**：fork 新行 `draft`，原待审保留。
4. **静默采集**：只读拉公开内容；禁止对源站写操作（评论/Issue/PR/Star 等）；规则拼装或不调模型原文迁移。
5. **配额与闸门**：约 5 篇/天；`pending_review` ≥ **20** 时拒绝入库/更新（`pending_backlog_full`）。
6. **Admin**：待审 / 写稿（纯文本+`##` 标题，沿用 `parsePostBody`）/ 回收站 三入口。
7. **公共 API**：访客列表与详情只返回 `lifecycle=published`。

## Consequences

**Positive**

- 运营可审可清；采集可扩展多 bot；合规边界清晰

**Negative / Trade-offs**

- 生命周期字段迁移与双字段同步有一点复杂度
- 首版源适配靠配置，内容质量靠编辑润色

## Follow-ups

- [x] `3-测试边界` / `4-测试条例` · canvas
- [x] 实现后更新 architecture 规范 CMS 字段；rag index 提示
- [ ] 生产：配置真实 RSS/GitHub query + pm2 cron；部署 API
