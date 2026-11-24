# ADR-20261024 · 全站客服独立通道（话术 + 转人工）

- Status: accepted
- Date: 2026-10-24
- Deciders: partner + agent
- Related canvas: `docs/spdd/canvases/20261024-customer-service.md`
- Supersedes:
- Superseded by:

## Context

需要全站机器人客服与人工接管。现有 `chat_*` / `/api/chat` 绑定 DeepSeek 试用计费，不能混用。无 WebSocket。管理员与客服本期共用 admin 账号接单。

## Decision

1. 新建 `cs_*` 表与 `/api/cs`，与试用聊天隔离，不计费。
2. 游客写入 `users`（`guest_<suffix>@guest.local`），展示 `游客_<suffix>`，发 user JWT；客户端持久化 token。
3. 本期仅固定话术（FAQ + 关键词）；AI 预留设置位，不做回复。
4. 「我在线」只写入 `cs_agent_presence`，用于转人工分配；全局模式以 admin settings 为准。
5. 实时：客户端短轮询（默认 ~2.5s），不做 WS/SSE。
6. 无人在线转人工：会话 `queued` + 系统安慰语，不暴露「无人」。

## Consequences

**Positive**

- 计费/审计边界清晰
- 可渐进加 AI、独立客服角色、WS

**Negative / Trade-offs**

- 游客占 `users` 行
- 轮询有延迟与多余请求

## Follow-ups

- [x] 更新 `3-测试边界/`
- [x] 更新 `4-测试条例/`
- [x] 更新 `1-资产规范/`
- [ ] 实现后摘要进 `rag/knowledge/`（可选）
