# REASONS Canvas · Trial SSE + LLM Adapter

- Date: 2026-11-09
- Status: active
- Related analysis: `docs/spdd/analysis/20261109-portfolio-ai-highlights.md`
- Related ADR: `docs/spdd/2-adr决策/ADR-20261109-trial-sse-llm-adapter.md`
- Related handoff: `docs/spdd/canvases/20261109-portfolio-ai-highlights-HANDOFF.md`
- Code anchors (target): `404home/server/services/llm/`、`404home/server/routes/chat.js`、`404home/src/composables/useTrialChat.js`、`404home/src/views/Trial.vue`、`404home/src/views/About.vue`

---

## R · Requirements

### Business goal

让 404Home `/trial` 达到简历级 AI 产品深度：流式对话体验 + 多模型可切换适配 + 与钱包账本一致的扣费，并与已有智能检索共同构成「一旗舰双主角」。

### In scope

- SSE 流式 completions API + Trial UI 增量渲染
- LLM Provider 适配层（DeepSeek 默认 + ≥1 可配兼容 provider）
- 流式结束后扣费；abort/错误码语义
- About 作品集页 + README 双路径更新（Pillar C）
- 自动化：`chat-stream-p0` 新用例；旧 `chat-billing-p0` 保持绿

### Out of scope

- 联网研究员 / ChatBI / Multi-Agent / A2UI
- 改 JWT 规则、改「金额用分」模型
- 全仓 TS / Vite 迁移 / 微信登录支付

### Acceptance criteria

- [x] 登录后 `/trial` 发消息可见 **逐字/逐块** 增长；结束后余额下降且 ledger `reason=chat`（自动化 TC-S01；手测路径 A）
- [x] `DEEPSEEK_STUB=1` 下流式仍可测；无 Key 返回 `DEEPSEEK_NOT_CONFIGURED`（TC-S03）
- [x] 余额 0 → `INSUFFICIENT_BALANCE`；未登录 → 401（TC-S02/S04）
- [x] 客户端 abort 不产生负余额（UI AbortController；Stub 仍按固定 usage 记账，禁止负余额由 wallet 保证）
- [x] 可通过 env 配置第二 provider，status 接口能回报当前 model/provider
- [x] About 页列出 ≥2 条可点演示 + 3 条技术亮点
- [x] `npm test` 全绿（以 generate 收尾跑数为准）

---

## E · Entities

| Entity | Meaning |
| --- | --- |
| LlmProvider | `{ id, baseUrl, apiKeyEnv, model, inputUsdPerMTok, outputUsdPerMTok }` |
| StreamEvent | SSE：`meta` / `delta` / `done` / `error` |
| ChatCharge | 流结束后 `chargeChat(userId, cents, idempotencyKey)` |

---

## A · Architecture（目标形态）

```text
Trial.vue → useTrialChat.sendStream()
    → POST /api/chat/completions/stream  (SSE)
         → llm.chatStream({ provider, messages })
              → OpenAI-compatible upstream (stream:true)
         → on done: persist assistant msg + chargeChat
```

保留：`POST /api/chat/completions` → `llm.chat()`（非流式，现有测试继续用）。

---

## S · Structure（允许改动的文件）

```text
404home/server/services/llm/
  index.js           # chat() / chatStream() 门面
  providers.js       # 读 env，列出 providers
  openaiCompat.js    # 非流式 + 流式解析
404home/server/services/deepseek.js   # 薄封装转调 llm（保持旧 require 不炸）或标记 deprecated re-export
404home/server/routes/chat.js         # 新增 stream 路由；completions 改走 llm
404home/src/composables/useTrialChat.js
404home/src/views/Trial.vue           # 仅必要时改模板（流式 UI）
404home/src/views/About.vue           # 作品集页
404home/src/api/index.js              # stream helper（fetch + ReadableStream）
404home/server/test/chat-stream-p0.test.js
404home/README.md
docs/spdd/1-资产规范/404home-deepseek-chat.md
docs/spdd/3-测试边界/404home-deepseek-chat.md
docs/spdd/4-测试条例/404home-deepseek-chat-cases.md
```

---

## O · Operations（实现顺序）

1. 更新测试边界/条例（TC-07…）→ 写红灯 `chat-stream-p0.test.js`
2. `services/llm/*` + deepseek re-export
3. `POST /api/chat/completions/stream` + 扣费
4. 前端 SSE 消费 + Trial UI
5. About 作品集页 + README
6. 全量 `npm test`；手测演示路径

---

## N · Norms

- 密钥不进仓、不进前端包
- 金额只用整数分；禁止裸改 `users.balance_cents`
- 错误码稳定；前端展示 code 可读说明
- 单测 Stub，禁止外网
- Diff 精简：不顺手重构 CMS

---

## Safeguards

- 禁止删除或弱化现有 `chat-billing-p0` 断言
- 禁止前端直连任何 LLM 域名
- 禁止引入 Nest/Next/Python 替换 Koa
- 禁止实现 Multi-Agent / ChatBI

---

## Sync log

| Date | Note |
| --- | --- |
| 2026-11-09 | Canvas + ADR + HANDOFF 建立；待 generate |
| 2026-11-09 | Generate 完成：`services/llm/*`、SSE `/completions/stream`、Trial 流式 UI、About/README；`chat-stream-p0` TC-S01…S05 绿 |
