# 测试边界 · 详情页相关工具推荐

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`
- Related canvas: `docs/spdd/canvases/20261006-related-tools.md`
- Related 条例: `docs/spdd/4-测试条例/404home-related-tools-cases.md`
- Related 规范: `docs/spdd/1-资产规范/404home-related-tools.md`
- Updated: 2026-10-12

## 1. System under test

`ToolDetail.vue` 相关推荐区块 + `GET /api/tools?category=&pageSize=`。

## 2. In scope

- 详情成功后才请求；排除当前 slug；最多 6 条
- 无 siblings 不渲染区块
- 详情错误不请求推荐
- 推荐失败不破坏主详情
- 卡片进详情；「查看更多」到分类

## 3. Out of scope（刻意不测）

- 标签相似度、广告、新 related API
- 分页性能压测

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| 详情失败仍请求 | 多余流量/错态 | P0 |
| 推荐失败拖垮详情 | 可用性 | P0 静默 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| tools list API | Real / Stub 失败 | 需可模拟失败 |

## 6. Environments

- Local: 选用有同分类多工具的 slug
- CI: 待定
- Forbidden: —
