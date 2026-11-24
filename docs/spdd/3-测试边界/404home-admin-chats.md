# 测试边界 · 后台会话审计

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`
- Related canvas: `docs/spdd/canvases/20261008-admin-chats.md`
- Related 条例: `docs/spdd/4-测试条例/404home-admin-chats-cases.md`
- Related 规范: `docs/spdd/1-资产规范/404home-admin-chats.md`
- Updated: 2026-10-12

## 1. System under test

Admin chat summary/sessions/messages API + `AdminChats.vue`。

## 2. In scope

- 仅 admin JWT；user 拒绝
- 汇总 → 会话列表 → 消息下钻
- 邮箱关键词过滤
- 前端不暴露 API Key

## 3. Out of scope（刻意不测）

- 编辑/删除用户消息（只读导向）
- 大数据量导出性能

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| 用户越权读会话 | 隐私 | P0 |
| Key 出现在响应 | 泄露 | P0 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| chat DB | Real 测试数据 | |
| admin JWT | Real | |

## 6. Environments

- Local: 造若干会话后查
- CI: 待定
- Forbidden: —
