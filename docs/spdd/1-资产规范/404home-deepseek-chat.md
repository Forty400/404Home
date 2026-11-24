# 规范 · DeepSeek 对话与计费

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261015-portfolio-freeze.md`；**`ADR-20261109-trial-sse-llm-adapter.md`（流式 + 适配层）**
- Related canvas: `docs/spdd/canvases/20261109-trial-sse-llm-adapter.md`；`docs/spdd/canvases/20261013-portfolio-tech-showcase.md`
- Related handoff: `docs/spdd/canvases/20261109-portfolio-ai-highlights-HANDOFF.md`
- Related tests: `3-测试边界/404home-deepseek-chat.md` · `4-测试条例/404home-deepseek-chat-cases.md`
- Updated: 2026-11-09
- Source confidence: high（非流式 + SSE 流式 P0 已落地；见 ADR-20261109）

## 1. Scope

服务端代理 LLM（OpenAI 兼容）、会话持久化、按 token 扣费；**含 SSE 流式**（ADR-20261109）。不含后台审计 UI（见 `404home-admin-chats.md`）；不含 Multi-Agent / ChatBI。

## 2. Rules

1. **仅服务端**调用 OpenAI 兼容 `/chat/completions`；前端禁止直连任何 LLM 域名。
2. 默认 provider=`deepseek`、模型 `deepseek-flash`，可用 env 覆盖；允许第二 OpenAI 兼容 provider（见 ADR-20261109）。
3. `POST /api/chat/completions`（user JWT）：创建/续会话 → 调上游 → 计费 → 返回 assistant + 新余额（**保留作兼容与回归**）。
4. `POST /api/chat/completions/stream`（user JWT）：SSE；事件 `meta` / `delta` / `done` / `error`；**流正常结束后**写 assistant 并 `chargeChat`。
5. 另提供 `GET /api/chat/sessions`、`GET /api/chat/sessions/:id/messages`；表 `chat_sessions` / `chat_messages`。
6. 计费：百万 token 单价（USD）× `USD_CNY` × `BILLING_MARKUP` → 分，向上取整；有用量时**最少 1 分**。
7. 扣费流：余额 > 0 才可调用 → 算费 → 更新余额（≥0）+ ledger（reason `chat`）+ 消息；禁止负余额。
8. 错误码：`INSUFFICIENT_BALANCE`、`DEEPSEEK_NOT_CONFIGURED`（及上游失败显式错误）；禁止静默失败。
9. Trial.vue / `useTrialChat` 优先走 **stream**；Key 仅服务器 env，禁止提交仓库。
10. 测试/CI：`DEEPSEEK_STUB=1` 时不发起外网；流式 Stub 须多帧 delta + 固定 usage；生产禁止依赖 Stub 充当真实上游。

## 3. Examples

**Good**

- 无 Key 返回 `DEEPSEEK_NOT_CONFIGURED`；余额 0 拒绝调用。

**Bad**

- 浏览器带 DeepSeek Key 直连；扣成负余额。

## 4. Enforcement

- Code anchors：`server/services/llm/`、`deepseek.js`（委托）、`routes/chat.js`（含 `/completions/stream`）、`wallet`、`Trial.vue` / `useTrialChat`
- 与 wallet / architecture 交叉检查；自动化 `chat-billing-p0` + `chat-stream-p0`
