# 资产规范 · 404Home 全站客服

- Status: active
- Related ADR: `ADR-20261024-customer-service`
- Related canvas: `20261024-customer-service`
- Updated: 2026-10-24

## 范围

全站客服通道：`/api/cs`、`cs_*` 表、C 端浮层、Admin 三栏工作台。与 DeepSeek 试用 `/api/chat` 隔离。

## 约定

1. 游客：`users.email = guest_<suffix>@guest.local`，展示名 `游客_<suffix>`；客户端存 user JWT。
2. 会话状态：`bot` →（transfer）`queued` | `human` → `closed`。
3. 消息 role：`user` | `bot` | `agent` | `system`。
4. 话术：FAQ 按钮用 `faq_label`；关键词 JSON 数组子串匹配；`sort` 越小优先。
5. Presence：仅影响 transfer 分配池；settings.mode 本期固定 `scripts`。
6. 无人在线默认文案：`当前询问人数过多，正在排队`（可 settings 覆盖）。
7. 客服消息不计费、不写试用 chat 表。

## UI

- C 端：右下角气泡；宽屏侧栏面板；窄屏底部抽屉。挂在 `MainLayout`（同 AuthModal）。
- Admin：`/admin/cs` 三栏；顶栏「我在线」。

## 相关

- 测试边界 / 条例：`3-测试边界/404home-customer-service.md`、`4-测试条例/404home-customer-service-cases.md`
