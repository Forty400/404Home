# 规范 · 详情页相关工具推荐

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-specs-by-module.md`
- Related canvas: `docs/spdd/canvases/20261006-related-tools.md`
- Related tests: `3-测试边界/404home-related-tools.md` · `4-测试条例/404home-related-tools-cases.md`
- Updated: 2026-10-12
- Source confidence: high（synced，AC 已勾选）

## 1. Scope

`ToolDetail` 主卡片下方的同分类推荐。不含标签相似度、广告位或新 API。

## 2. Rules

1. 仅在详情**加载成功**后请求；slug 变化时刷新；详情错误页**不**请求推荐。
2. 数据：`GET /api/tools?category=<category_slug>&pageSize=8`（`api.getTools`），排除当前 slug，最多展示 **6** 条。
3. **不**新增 related API；不做 tag 匹配。
4. 无同分类 siblings（空或仅自己）时：**不渲染**推荐区块。
5. 列表复用 `ToolCard`；区块含「查看更多」链到分类页。
6. 推荐请求失败：静默为空，**不得**拖垮主详情。

## 3. Examples

**Good**

- `/tool/chatgpt` 下方出现同分类其他卡片，不含自身。

**Bad**

- 详情 404 仍打 related 接口；硬编码推荐列表。

## 4. Enforcement

- Code anchor：`404home/src/views/ToolDetail.vue`
- RAG：`docs/spdd/rag/knowledge/404home-related-tools.md`
