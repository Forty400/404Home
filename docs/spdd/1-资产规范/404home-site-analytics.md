# 资产规范 · 站内访问量

- Status: active
- Related ADR: `ADR-20261024-site-analytics`
- Updated: 2026-10-24

## 约定

1. `POST /api/analytics/pageview`：`{ path, visitorId }`；`/admin*` 不上报入库。
2. `GET /api/stats/traffic`：admin；今日/7/30 PV·UV、`daily`、`topPaths`。
3. visitorId：浏览器 `404home_visitor_id`；路由 `afterEach` 触发。
4. 概览页展示访问量卡片 + SVG 趋势 + Top 路径；库存卡片仍用 `GET /api/stats`。
