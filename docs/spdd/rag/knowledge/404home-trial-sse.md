# 404Home Trial SSE + LLM 适配层

- Tags: 404home, trial, sse, llm, billing
- ADR: `docs/spdd/2-adr决策/ADR-20261109-trial-sse-llm-adapter.md`
- Canvas: `docs/spdd/canvases/20261109-trial-sse-llm-adapter.md`

## Facts

- `POST /api/chat/completions/stream`：SSE 事件 `meta` / `delta` / `done` / `error`；正常结束后写 assistant + `chargeChat`。
- `POST /api/chat/completions` 保留作非流式兼容与回归。
- 适配层：`404home/server/services/llm/`（OpenAI 兼容）；默认 `deepseek`；第二 provider 经 `LLM_SECONDARY_*`。
- `deepseek.js` 保持旧 export 形状，内部委托 llm。
- 单测：`DEEPSEEK_STUB=1`；`server/test/chat-stream-p0.test.js`（TC-S01…S05）。
- Trial UI：`useTrialChat` 消费 SSE；支持 AbortController「停止生成」。
- Key 仅服务端；错误码兼容 `DEEPSEEK_NOT_CONFIGURED` / `INSUFFICIENT_BALANCE`。
