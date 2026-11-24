# 测试边界 · 站内访问量

- Status: active
- Related ADR: `ADR-20261024-site-analytics.md`
- Related canvas: `20261024-site-analytics.md`
- Related 条例: `404home-site-analytics-cases.md`
- Updated: 2026-10-24

## 1. System under test

`routes/analytics.js`、`routes/stats.js` traffic、`page_views` 表。

## 2. In scope

- pageview 写入
- traffic 聚合（今日/7/30 PV UV、daily、top paths）
- 非 admin 读 traffic → 403

## 3. Out of scope

- 前端 SVG 像素
- Bot 过滤、IP、实时大屏

## 4. Risk hotspots

| Area | Coverage |
| --- | --- |
| 空 path / 过长 path | 400 |
| 聚合日期边界 | TC daily counts |
