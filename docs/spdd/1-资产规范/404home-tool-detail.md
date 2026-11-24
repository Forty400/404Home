# 规范 · 工具详情页

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-specs-by-module.md`
- Related canvas: `docs/spdd/canvases/20261002-tool-detail.md`
- Related tests: `3-测试边界/404home-tool-detail.md` · `4-测试条例/404home-tool-detail-cases.md`
- Updated: 2026-10-21
- Source confidence: high（synced；2026-10-21 放宽 schema 三字段）

## 1. Scope

工具详情路由、数据获取与卡片跳转约定。不含相关推荐（见 `404home-related-tools.md`）。视觉以主题规范为准（不再要求「纸感浅绿」）。

## 2. Rules

1. 路由：`/tool/:slug`，名 `tool-detail`，组件 `404home/src/views/ToolDetail.vue`（MainLayout 子路由，懒加载）。
2. 链接用 **slug**（非 id）保证稳定；API `GET /api/tools/:idOrSlug`，前端封装 `api.getTool(slug)`。
3. 详情展示：name、summary、tags、分类名、`is_hot` / `is_new`、访问官网；以及决策字段 `pricing` / `region_avail` / `scenario`（可空）；**不**做评论/评分/收藏/长文正文（本阶段）。
4. `ToolCard`：主体进详情；底部「访问」外链 `target=_blank` 且 `@click.stop`；`rel="noopener noreferrer"`。
5. 错误/缺失 slug：空态 + 可回首页（或分类），禁止白屏。
6. Schema：允许 `tools` 增加决策三字段（见 `ADR-20261021-ux-week-bc`）；不加登录态详情 API、不新增依赖。
7. 详情内容用文本绑定，禁止执行未消毒 HTML。

## 3. Examples

**Good**

- `/tool/chatgpt` 展示库内工具信息；卡片名进详情，「访问」仍外链。

**Bad**

- 前端写死工具列表；详情页 `v-html` 渲染未过滤 summary。

## 4. Enforcement

- Code anchors：`router/index.js`、`ToolCard.vue`、`ToolDetail.vue`、`api/index.js`
- RAG：`docs/spdd/rag/knowledge/404home-tool-detail.md`
