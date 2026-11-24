# ADR-20261021 · 首页热门文章专区（宿主 IA）

- Status: accepted
- Date: 2026-10-21
- Deciders: user（默认提案）+ AI（8 年独立开发者产品拍板）
- Related canvas: `docs/spdd/canvases/20261021-hot-articles-home.md`
- Related analysis: `docs/spdd/analysis/20261021-hot-articles-home.md`
- Supersedes: （局部放宽）`ADR-20261015-portfolio-freeze` 中「资讯运营扩张」对**宿主首页 IA** 的冻结
- Superseded by:

## Context

作品集冻结把「资讯运营扩张」挡在窗口外，以免稀释 Trial 叙事。用户现要求 `/` 改为 AI 图文热门专区，并站内载文、注明出处。独立站若首页仍是纯工具墙，内容与回访动机偏弱；但真·全网爬虫对个人站法律与运维成本过高。

## Decision

1. **宿主首页 IA**：`/` 以热门文章图文 Feed 为主；下方保留「热门工具」一条（方案 B）。Trial 仍是作品集主角；Header 试用入口不变。
2. **内容形态**：正文**站内**存储与阅读；必填/展示 `source_name` + `source_url`（出处）。禁止假装「整站转载」而无出处。
3. **模型**：扩展 `posts`：新增 `topic`（`plugin|dev|method|news`）、`source_name`、`source_url`、`is_hot`；保留 `type`（`news|tutorial`）兼容旧侧栏/路由。
4. **中台首期**：服务端 **ingest/seed 作业**写入 ≥20 条带封面整理稿（公开话题的站内摘要 + 出处链接）。**不做**定时爬虫、反爬对抗、独立中台服务。
5. **主题 UI**：色板不动；Header 主题控件改为电灯泡按钮（亮灯=亮色，灭灯=暗色）；偏好键与 `useTheme` 语义不变。
6. **与作品集冻结关系**：允许本次宿主首页 IA + 一次性内容入库；仍冻结微信/支付、多模型 Agent、UGC 社区、定时抓取运营平台。

## Consequences

**Positive**

- 首页有内容密度与回访钩子；工具发现不丢
- 合规边界清晰（整理稿 + 出处，非镜像爬取）
- 复用 `posts` / `PostDetail` / admin，改动面可控

**Negative / Trade-offs**

- 首批内容靠 seed，非实时新闻流
- `type` + `topic` 双字段有一点认知成本，换取零破坏兼容

## Follow-ups

- [x] 更新 `3-测试边界/404home-hot-articles.md`、`4-测试条例/404home-hot-articles-cases.md`
- [ ] 实现后按需摘要 `rag/knowledge/`；必要时轻补 `1-资产规范/404home-architecture.md` CMS 字段
- [x] 画布 `20261021-hot-articles-home`
