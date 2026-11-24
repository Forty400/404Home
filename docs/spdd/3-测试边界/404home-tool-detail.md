# 测试边界 · 工具详情页

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`
- Related canvas: `docs/spdd/canvases/20261002-tool-detail.md`
- Related 条例: `docs/spdd/4-测试条例/404home-tool-detail-cases.md`
- Related 规范: `docs/spdd/1-资产规范/404home-tool-detail.md`
- Updated: 2026-10-12

## 1. System under test

`ToolDetail.vue`、`ToolCard.vue`、路由 `/tool/:slug`、`GET /api/tools/:idOrSlug`。

## 2. In scope

- 合法 slug 展示核心字段与外链
- ToolCard 主体进详情；「访问」外链且不冒泡
- 非法 slug 空态可回首页
- 外链 `noopener`

## 3. Out of scope（刻意不测）

- SEO/SSR、评论评分收藏
- schema 迁移、admin 录入流程本身
- 视觉像素级回归（主题另测）

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| 卡片点击冒泡 | 误跳详情/外链 | P0 交互 |
| XSS via summary | 未消毒 HTML | 文本绑定/无脚本执行 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| tools API | Real | seed 中已知 slug |
| 外链站点 | Real 打开即可 | 不验证第三方可用性 |

## 6. Environments

- Local: 前后端联调
- CI: 待定
- Forbidden: 改生产 DB 造数据
