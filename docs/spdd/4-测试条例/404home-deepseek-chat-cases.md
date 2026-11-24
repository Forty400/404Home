# 测试条例 · DeepSeek 对话与计费

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261015-portfolio-freeze.md`；`docs/spdd/2-adr决策/ADR-20261109-trial-sse-llm-adapter.md`
- Related boundary: `docs/spdd/3-测试边界/404home-deepseek-chat.md`
- Related canvas: `docs/spdd/canvases/20261109-trial-sse-llm-adapter.md`
- Code tests: `404home/server/test/chat-billing-p0.test.js`；`404home/server/test/chat-stream-p0.test.js`
- Updated: 2026-11-09

## Cases

### TC-01 · 有 Key 时聊天扣费并记 ledger

- Priority: P0
- **Given**: user JWT；余额 > 0；`DEEPSEEK_STUB=1`（或真实 Key）
- **When**: `POST /api/chat/completions`
- **Then**: 返回 assistant；余额下降；ledger 有 reason `chat`
- **Notes**: CI 必须用 Stub

### TC-02 · 余额不足拒绝

- Priority: P0
- **Given**: 余额为 0
- **When**: 发起 completions
- **Then**: 失败，code `INSUFFICIENT_BALANCE`；不产生负余额
- **Notes**:

### TC-03 · 未配置 Key

- Priority: P0
- **Given**: 服务端无 DeepSeek Key 且未开 Stub
- **When**: 发起 completions（余额 > 0）
- **Then**: code `DEEPSEEK_NOT_CONFIGURED`
- **Notes**:

### TC-04 · 会话列表与历史

- Priority: P1
- **Given**: 用户已有会话与消息
- **When**: `GET /api/chat/sessions` 与 `.../messages`
- **Then**: 返回对应用户数据；Trial 侧栏可展示/删除
- **Notes**: UI 已实现；作品集窗口自动化延后（原 P0 降为 P1 自动化优先级）

### TC-05 · 前端不直连 DeepSeek

- Priority: P0
- **Given**: Trial 发消息
- **When**: 观察浏览器网络
- **Then**: 仅请求本站 `/api/chat/*`，无 `api.deepseek.com`
- **Notes**: **手测**（作品集演示）；无自动化

### TC-06 · 未登录不能聊天

- Priority: P0
- **Given**: 无 user token
- **When**: POST completions
- **Then**: 401
- **Notes**:

### TC-07 · SSE 流式主路径扣费

- Priority: P0
- **Given**: user JWT；余额 > 0；`DEEPSEEK_STUB=1`
- **When**: `POST /api/chat/completions/stream`
- **Then**: 收到 ≥1 帧 `delta` 与最终 `done`；余额下降；ledger reason `chat`；`done` 含 message.id 与 cost_cents
- **Notes**: 自动化 `chat-stream-p0` TC-S01；契约见 ADR-20261109

### TC-08 · 流式开流前余额不足

- Priority: P0
- **Given**: 余额为 0
- **When**: POST stream
- **Then**: `402` + `INSUFFICIENT_BALANCE`；不产生负余额
- **Notes**: `chat-stream-p0` TC-S02

### TC-09 · 流式未配置 Key

- Priority: P0
- **Given**: 无 Key 且未 Stub
- **When**: POST stream（余额 > 0）
- **Then**: `503` + `DEEPSEEK_NOT_CONFIGURED`（或兼容 `LLM_NOT_CONFIGURED`）
- **Notes**: `chat-stream-p0` TC-S03

### TC-10 · 流式未登录

- Priority: P0
- **Given**: 无 user token
- **When**: POST stream
- **Then**: 401
- **Notes**: `chat-stream-p0` TC-S04

### TC-11 · 非流式 completions 回归

- Priority: P0
- **Given**: 与 TC-01 相同
- **When**: 仍调用 `POST /api/chat/completions`
- **Then**: 行为与升级前一致（扣费 + ledger）
- **Notes**: `chat-stream-p0` TC-S05 或继续 `chat-billing-p0`

### TC-12 · 客户端 abort 不负余额

- Priority: P1
- **Given**: 流式进行中 abort
- **When**: 连接中断
- **Then**: `balance_cents >= 0`；无双扣同一幂等键
- **Notes**: 可选自动化 TC-S06；语义见 ADR-20261109

## Traceability

| Case | Code test | Boundary / Spec |
| --- | --- | --- |
| TC-01 | `chat-billing-p0` TC-01 | deepseek-chat §2 |
| TC-02 | `chat-billing-p0` TC-02 | deepseek-chat §2 |
| TC-03 | `chat-billing-p0` TC-03 | deepseek-chat §2 |
| TC-04 | （延后） | deepseek-chat §2.4 |
| TC-05 | 手测 | deepseek-chat §2.1 |
| TC-06 | `chat-billing-p0` TC-06 | auth / architecture |
| TC-07 | `chat-stream-p0` TC-S01 | ADR-20261109 |
| TC-08 | `chat-stream-p0` TC-S02 | ADR-20261109 |
| TC-09 | `chat-stream-p0` TC-S03 | ADR-20261109 |
| TC-10 | `chat-stream-p0` TC-S04 | ADR-20261109 |
| TC-11 | `chat-billing-p0` / TC-S05 | ADR-20261109 |
| TC-12 | TC-S06（可选） | ADR-20261109 |
