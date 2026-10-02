---
title: 工具详情页约定
tags: [404home, frontend, tools, routing]
updated: 2026-10-02
---

# 工具详情页约定

## 路由

- 路径：`/tool/:slug`
- 路由名：`tool-detail`
- 组件：`404home/src/views/ToolDetail.vue`

## 数据

- API：`GET /api/tools/:idOrSlug`（前端用 slug）
- 封装：`api.getTool(slug)`

## UI 行为

- `ToolCard` 主体链到详情；底部「访问」仍外链且 `@click.stop`
- 详情展示 summary / tags / 分类 / 热门新标记 / 访问官网
- 错误 slug：空态 + 回首页

## SPDD

- 分析：`docs/spdd/analysis/20261002-tool-detail.md`
- 画布：`docs/spdd/canvases/20261002-tool-detail.md`
