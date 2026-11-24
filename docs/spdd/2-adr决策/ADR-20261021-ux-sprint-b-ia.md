# ADR-20261021 · UX Sprint B：信息架构 / 标题 / 列表空闪

- Status: accepted
- Date: 2026-10-21
- Deciders: user（继续 Sprint B）+ AI
- Related canvas: `docs/spdd/canvases/20261021-ux-sprint-b-ia.md`
- Related analysis: `docs/spdd/analysis/20261021-forty40-ux-review.md`（UX-25～30）
- Extends: `ADR-20261021-ux-week-bc.md` · `ADR-20261021-hot-articles-home.md`

## Context

Sprint A 止血后，二次走查仍见：工具分类条出现在文章/试用页；首页三套过滤语义不清；全站 `document.title` 相同；`/news` 未区分 loading 与空。

## Decision

1. **工具分类条作用域（UX-26）**：仅在「工具发现」路由显示：`home` · `category` · `search` · `tool-detail`。内容/账户页（`news*` · `tutorials*` · `about` · `trial`）隐藏。
2. **三套入口语义（UX-25）**：首页保留三层但**标签说清**——topic tab=滤文章；chip=搜工具；顶部分类条=工具分类。不做合并搜索。
3. **窄屏导航（UX-27）**：汉堡菜单展开时隐藏分类条，避免与菜单抢视线；收起后按作用域再显示。
4. **Hero（UX-28）**：改为短价值主张 + 试用 CTA 链；去掉「先读…再用…」说明书腔。
5. **document.title（UX-29）**：路由 `meta.title` + 详情页可用动态后缀；默认后缀 `404Home`。
6. **资讯/教程列表（UX-30）**：`loading` 骨架；仅 `!loading && empty` 显示暂无。（`Tutorials` 同改。）

## Consequences

- 阅读流不再被工具 pill 打断；标签页可辨；空闪消失
- 首页仍有多层控件，但职责文案分开（接受复杂度上限）

## Follow-ups

- [x] 测试边界/条例
- [x] 实现后看板 UX-25～30 → done
- [ ] 部署线上
