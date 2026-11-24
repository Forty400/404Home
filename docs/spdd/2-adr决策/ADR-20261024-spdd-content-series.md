# ADR-20261024 · SPDD 内容系列首发 + 阅读体验小优化

- Status: accepted
- Date: 2026-10-24
- Deciders: user（直接开始）+ AI
- Related canvas: `docs/spdd/canvases/20261024-spdd-content-series.md`
- Related analysis: `docs/spdd/analysis/20261021-forty40-ux-review.md`（UX-35）
- Supersedes:
- Superseded by:

## Context

首页热门文章专区与 UX Sprint 已落地，但 Feed 仍以短整理稿为主，缺站内原创方法论长文；About 仍写「工具收录站」，与「内容站 + 试用」叙事不一致。用户要求按现有 UX 做部分布局/功能优化，并开始输出 SPDD 规划手册、仓库 SPDD 化教程等文章。

## Decision

1. **内容**：在 `seed` 以 `topic=method`、`type=tutorial` 新增至少两篇站内原创整理稿——《SPDD 规划指导手册》《仓库 SPDD 化教程》；出处指向本仓库公开文档路径/概念来源；正文可读厚度远高于短讯（≥800 字级，且仍满足 ≥280 闸门）。
2. **热门配额**：`capHotArticles` 按 **id 降序**保留每 topic 最多 3 条 `is_hot`，使新入库稿优先占热门位（不改「每 topic ≤3」上限）。
3. **阅读 UX**：`PostDetail` 支持轻量正文块（`##` 标题 + 段落），并展示同 topic 相关文推荐（排除自身，≤3）。
4. **About（UX-35）**：文案对齐「AI 内容站 + 工具可搜 + DeepSeek 试用」，不再只写工具墙。
5. **不做**：Markdown 全语法、独立 CMS 编辑器、定时爬虫、未登录真试用（UX-31）。

## Consequences

**Positive**

- 方法论 Tab 有可传播的系列入口；新稿不被旧热门挤掉
- About / 详情阅读与首页 IA 一致

**Negative / Trade-offs**

- 正文仍非完整 Markdown；`##` 仅为展示约定
- 热门「优先新 id」可能让旧精品暂时落榜（可接受，配额仍严）

## Follow-ups

- [ ] 后续可再补「SPDD 与 Superpowers/Ponytail」第三篇
- [ ] 线上库需重启 API 触发 `ensureHotArticles` 插入新标题
