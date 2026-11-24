# 测试边界 · DeepSeek 对话与计费

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261015-portfolio-freeze.md`；`docs/spdd/2-adr决策/ADR-20261109-trial-sse-llm-adapter.md`
- Related canvas: `docs/spdd/canvases/20261109-trial-sse-llm-adapter.md`；`docs/spdd/canvases/20261013-portfolio-tech-showcase.md`
- Related handoff: `docs/spdd/canvases/20261109-portfolio-ai-highlights-HANDOFF.md`
- Related 条例: `docs/spdd/4-测试条例/404home-deepseek-chat-cases.md`
- Related 规范: `docs/spdd/1-资产规范/404home-deepseek-chat.md`
- Updated: 2026-11-09

## 1. System under test

- `POST /api/chat/completions`（非流式，兼容）
- `POST /api/chat/completions/stream`（SSE，ADR-20261109）
- sessions/messages、LLM 代理（`services/llm` / deepseek 委托）、计费与 ledger、`Trial.vue` / `useTrialChat`

## 2. In scope

- user JWT 才能聊天；服务端代理（非前端直连）
- 有 Key 或 Stub 时扣费 + ledger `chat`；余额 0 → `INSUFFICIENT_BALANCE`
- 无 Key 且非 Stub → `DEEPSEEK_NOT_CONFIGURED`
- 会话列表与历史消息；最少 1 分用量计费（有 usage 时）
- **SSE**：delta/done/error；流结束后扣费；abort 不负余额
- **LLM 适配**：默认 deepseek；可选第二 OpenAI 兼容 provider（env）

## 3. Out of scope（刻意不测）

- 上游 SLA / 生成内容质量 / 多模型质量对比压测
- 后台审计 UI（见 admin-chats）
- 联网 Agent / ChatBI / Multi-Agent

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| Key 泄露前端 | 资损 | P0 静态/网络（TC-05 手测） |
| 负余额 / 双扣 | 资损 | P0 非流式 + 流式 |
| 流式断线账本 | 资损/体验 | P1 abort |
| 未登录调模型 | 滥用 | P0 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| LLM upstream | **Stub 优先** | `DEEPSEEK_STUB=1`；流式 Stub 多帧 delta |
| wallet | Real | `chargeChat` |
| DB | 临时 SQLite（`DB_PATH`） | |

## 6. Environments

- Local: Stub（默认测计费）或私有 Key（不入库）
- CI: **Stub only**；禁止依赖真实 API Key
- Forbidden: 把 Key 写入仓库或前端；CI 打真实上游
