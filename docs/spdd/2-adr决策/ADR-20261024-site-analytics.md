# ADR-20261024 · 站内访问量自建统计

- Status: accepted
- Date: 2026-10-24
- Deciders: partner + agent（继续=默认方案）
- Related canvas: `docs/spdd/canvases/20261024-site-analytics.md`

## Context

交付需要后台可视化访问量等数据。现有 `/api/stats` 仅库存计数，无 PV/UV。不引入第三方统计与图表依赖。

## Decision

1. 自建 `page_views` + 公开 `POST /api/analytics/pageview`（路径 + visitorId）。
2. C 端路由切换时上报；visitorId 存 localStorage。
3. Admin：`GET /api/stats/traffic` 返回今日/7日/30日 PV·UV、按日序列、Top 路径；概览页用纯 SVG 图展示。
4. 不计费、不绑用户 JWT；不采集 IP（可后续加）。

## Consequences

**Positive**：可交付、可控、零新依赖  
**Trade-offs**：刷新/多标签会抬 PV；无真实 UV 指纹；需重启 API 建表

## Follow-ups

- [x] 测试边界/条例
- [ ] 可选：排除 admin 路径、bot UA
