# ADR-20261109 · Trial SSE 流式 + LLM 适配层（作品集含金量升级）

- Status: accepted
- Date: 2026-11-09
- Deciders: user + AI
- Related canvas: `docs/spdd/canvases/20261109-trial-sse-llm-adapter.md`
- Related handoff: `docs/spdd/canvases/20261109-portfolio-ai-highlights-HANDOFF.md`
- Related analysis: `docs/spdd/analysis/20261109-portfolio-ai-highlights.md`
- Supersedes: （局部）`ADR-20261015-portfolio-freeze.md` 中「窗口内冻结 … 多模型/Agent、流式 SSE」就 **本模块** 的禁止条款
- Superseded by:

## Context

求职反馈：前端简历缺少可讲的 AI 项目深度。404Home 已有 `/trial` 非流式计费闭环与 `/smart-search` RAG+MCP（见 ADR-20261105），但 Trial 仍为一次性 JSON 响应，规范明确「阶段一：非流式」。要达到简历级含金量，需要把 **流式体验 + 统一 LLM 适配 + 扣费一致性** 做成可演示、可测的证据，而不是另起课设玩具仓。

## Decision

1. **局部解冻**：允许在现有 Vue3 + Koa + SQLite 栈内落地：
   - `POST /api/chat/completions/stream`（SSE）
   - `server/services/llm/` 统一适配层（OpenAI 兼容）；默认 provider=`deepseek`，至少再接 **1 个**国产兼容端点（如通过 `LLM_PROVIDERS` env 配置第二 baseUrl/model）
   - `/trial` 前端改为消费 SSE（打字机增量渲染）；保留原 `POST /api/chat/completions` 作兼容与非流式回归
2. **计费不变量不变**：Key 仅服务端；金额用分；改余额走 `wallet_ledger`；余额不足 / 未配置 Key 仍用既有错误码；流式结束后按 usage 扣费（Stub 可固定 usage）
3. **中断语义**：客户端断开或主动 abort → 服务端停止读上游；**已产生 completion 的部分**按实际上游 usage（或 Stub 规则）记账；禁止静默吞错误
4. **叙事**：作品集仍双主角——`/trial`（流式计费）第一，`/smart-search`+MCP 第二；**About 升级为作品集页**（见同批 HANDOFF Pillar C）
5. **仍冻结**：联网研究员、ChatBI、Multi-Agent Supervisor、A2UI 整套、微前端、全仓 TS、微信/支付。后续另开 ADR
6. **证据标准不变**：主张须链到本 ADR + 规范更新 + 自动化用例（或明确手测）

## Consequences

**Positive**

- 简历可写「SSE 流式 + 多模型适配 + 账本计费」完整闭环
- 不推翻现有 chat-billing P0；非流式接口可继续作对照

**Negative / Trade-offs**

- SSE 与扣费时序更复杂（需明确「先流后扣 / 失败码」）
- 第二 provider 增加配置面；默认仍 DeepSeek，避免无配置时行为漂移

## Follow-ups

- [x] 更新 `3-测试边界/404home-deepseek-chat.md` 与 `4-测试条例`（新增 TC-07…流式）
- [x] 更新 `1-资产规范/404home-deepseek-chat.md`（取消「阶段一非流式」；写清 SSE 事件）
- [x] 落地代码 + `server/test/chat-stream-p0.test.js`
- [x] About 作品集页 + README 演示路径更新
- [x] 摘要进 `rag/knowledge/404home-trial-sse.md`
