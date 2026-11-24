# 规范 · 后台会话审计

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-specs-by-module.md`
- Related canvas: `docs/spdd/canvases/20261008-admin-chats.md`
- Related tests: `3-测试边界/404home-admin-chats.md` · `4-测试条例/404home-admin-chats-cases.md`
- Updated: 2026-10-12
- Source confidence: medium（画布 synced，AC 较薄）

## 1. Scope

管理员只读查看聊天汇总、会话列表与消息明细。不含用户侧 Trial UI。

## 2. Rules

1. 仅 **admin JWT** 可访问；user JWT 禁止。
2. API：`GET /api/chat/admin/summary`、`/admin/sessions`、`/admin/sessions/:id`（以画布为准）。
3. UI：`AdminChats.vue` + admin 路由/侧栏；支持按邮箱关键词过滤。
4. 能力定位：汇总 → 会话（tokens/cost）→ 消息下钻；**只读**导向。
5. 前端**不**暴露 API Key。

## 3. Examples

**Good**

- 管理员按邮箱筛会话并查看消息与费用。

**Bad**

- 用户 token 打 admin chat API；前端打包 DeepSeek Key。

## 4. Enforcement

- Code anchors：chat admin routes、`AdminChats.vue`
- 与 auth 双角色、deepseek-chat 密钥规则交叉检查
