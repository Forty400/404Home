# 测试边界 · UX Sprint B（IA）

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261021-ux-sprint-b-ia.md`
- Related canvas: `docs/spdd/canvases/20261021-ux-sprint-b-ia.md`
- Related 条例: `docs/spdd/4-测试条例/404home-ux-sprint-b-ia-cases.md`
- Updated: 2026-10-21

## 1. System under test

- `shouldShowCategoryNav(routeName, { navOpen })`
- `resolveDocumentTitle(routeLike)`
- （Hero / News UI 以源码关键字或既有 listPhase 辅证）

## 2. In scope

- 工具发现 vs 内容路由布尔
- 汉堡打开时强制隐藏分类条
- 主要路由 title 字符串

## 3. Out of scope

- 视觉像素、SEO og 标签、服务端渲染 title

## 4. Environments

- Vitest：`npm test` / `npx vitest run`
