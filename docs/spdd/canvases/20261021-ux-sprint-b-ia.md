# REASONS Canvas · UX Sprint B（UX-25～30 IA）

- Date: 2026-10-21
- Status: synced
- Related analysis: `docs/spdd/analysis/20261021-forty40-ux-review.md`
- Related ADR: `docs/spdd/2-adr决策/ADR-20261021-ux-sprint-b-ia.md`
- Related tests: `3-测试边界/404home-ux-sprint-b-ia.md` · `4-测试条例/404home-ux-sprint-b-ia-cases.md`
- Code anchors: `shouldShowCategoryNav.js`、`documentTitle.js`、`AppHeader.vue`、`Home.vue`、`router/index.js`、`News.vue`、`Tutorials.vue`

---

## R · Requirements

### Business goal

降低迷路与空闪：分类条只在工具语境出现；Hero/标题可辨；资讯列表不误报空。

### In scope

- UX-25～30（见 ADR）

### Out of scope

- UX-31 匿名真试用、P2 图标/About/主题图标、支付

### Acceptance criteria

- [x] `shouldShowCategoryNav`：工具发现路由 true，内容/试用 false
- [x] 汉堡 `navOpen` 时分类条不渲染
- [x] Hero 无「先读…再用…」；有试用入口链
- [x] `resolveDocumentTitle` 覆盖主要路由名
- [x] News/Tutorials：loading 不显示「暂无」
- [x] P0 自动化绿

---

## E · Entities

| Entity | Meaning |
| --- | --- |
| ToolDiscoveryRoute | home/category/search/tool-detail |
| DocTitle | meta.title + 站点后缀 |

---

## A · Approach

纯函数锁行为 + 薄接线；列表复用 `listPhase`。

---

## S · Structure

| Path | Change |
| --- | --- |
| ADR / 边界 / 条例 | 本轮 |
| `src/utils/shouldShowCategoryNav.js` + spec | UX-26/27 |
| `src/utils/documentTitle.js` + spec | UX-29 |
| `AppHeader.vue` | 条件渲染分类条 |
| `Home.vue` | Hero + 标签文案 |
| `router/index.js` | meta.title + afterEach |
| `News.vue` · `Tutorials.vue` | loading/空态 |

---

## O · Operations

### Op 1 · 资产与红测

- **Done when**: 用例先失败

### Op 2 · 实现

- **Done when**: 绿 + 验收点

### Op 3 · 回写看板 / synced

---

## N · Norms

- 无新依赖；title 后缀统一 ` · 404Home`
- 内容页隐藏分类条，不删组件

---

## S · Safeguards

- Must not: 改搜索为全文搜；未登录打模型
- Must not: 从工具发现页移除分类条

---

## Sync log

| Date | Action |
| --- | --- |
| 2026-10-21 | active |
| 2026-10-21 | 实现 UX-25～30 | synced |
