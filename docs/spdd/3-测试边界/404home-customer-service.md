# 测试边界 · 404Home 全站客服

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261024-customer-service.md`
- Related canvas: `docs/spdd/canvases/20261024-customer-service.md`
- Related 条例: `docs/spdd/4-测试条例/404home-customer-service-cases.md`
- Updated: 2026-10-24

## 1. System under test

`404home/server/routes/cs.js` + `cs_*` 表；用户浮层与 admin 工作台行为以 API 契约为准（P0 以 API 为主）。

## 2. In scope

- Guest bootstrap + JWT
- FAQ/关键词话术匹配与兜底
- 转人工：有在线分配 / 无人排队安慰语
- Admin 回复权限（assignee）
- Presence 开关影响分配池
- 与 `/api/chat` 隔离（客服不写 wallet ledger）

## 3. Out of scope（刻意不测）

- AI 回复
- WebSocket
- 前端像素/响应式截图
- 压力下的轮询性能

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| Guest 身份 | 伪造/串号 | TC guest + session owner |
| Transfer 分配 | 分错人/无人误接 | TC online/offline |
| Agent reply | 非 assignee 写入 | TC 403 |
| Billing bleed | 误扣费 | 断言无 chat ledger |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| SQLite | Real test DB | helpers |
| DeepSeek | N/A | 不调用 |
| Admin/User JWT | Real sign | helpers |

## 6. Environments

- Local: `node --test server/test/cs-p0.test.js`
- CI: 随 `404home` server test suite
- Forbidden in unit/integration: 真实外网 LLM
