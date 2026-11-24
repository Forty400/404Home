---
title: 详情页相关工具推荐
tags: [404home, frontend, tools]
updated: 2026-10-12
---

# 详情页相关工具推荐

> 完整规范：`docs/spdd/1-资产规范/404home-related-tools.md`

- 位置：`ToolDetail.vue` 主卡片下方
- 数据：`GET /api/tools?category=<category_slug>&pageSize=8`
- 规则：排除当前 `slug`，最多展示 6 条；无 siblings 不渲染区块
- 组件：复用 `ToolCard`
- SPDD：`docs/spdd/analysis/20261006-related-tools.md`、`docs/spdd/canvases/20261006-related-tools.md`
