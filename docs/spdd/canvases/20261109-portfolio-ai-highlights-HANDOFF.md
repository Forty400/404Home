# HANDOFF · 给项目侧 AI 的实现说明书（404Home 作品集 AI 含金量 · 一旗舰三柱）

> **用法**：把本文 **全文** 发给仓库 `E:\AAAproject\AI_SPACE` 内的 AI（或粘贴为任务提示）。  
> **权威顺序**：冲突时以 **ADR-20261109 → 本 HANDOFF → 测试条例 → 画布** 为准。  
> **不要**另起技术栈；**不要**做联网研究员 / ChatBI / Multi-Agent / A2UI。

---

## 0. 一句话任务

把 **404Home** 升级为简历可深挖的旗舰 AI 项目：**Pillar A** Trial 改为 SSE 流式 + LLM 适配层（≥2 可配 provider）且扣费与账本一致；**Pillar B** 巩固已有智能检索证据（评测可跑、MCP 可指）；**Pillar C** About/README 变成作品集说明书。最终让候选人能写「计费流式对话 + RAG/MCP」而不是「调过 ChatGPT」。

---

## 1. 仓库与路径

| 项 | 路径 |
| --- | --- |
| 仓根 | `E:\AAAproject\AI_SPACE` |
| 前端/后端代码 | `E:\AAAproject\AI_SPACE\404home` |
| 前台 | Vue 3 + Vue Router + Vue CLI（`404home/src/`） |
| API | Koa（`404home/server/`，入口 `index.js` / `app.js`） |
| 现有非流式聊天 | `server/routes/chat.js` → `POST /api/chat/completions` |
| 现有 LLM | `server/services/deepseek.js`（`stream:false`；`DEEPSEEK_STUB=1`） |
| 现有扣费 | `server/services/wallet.js` → `chargeChat` |
| 现有 Trial UI | `src/views/Trial.vue` + `src/composables/useTrialChat.js` |
| 已有 RAG+MCP | `/smart-search`；`ADR-20261105`；`mcp-server/`（**本批以巩固为主，勿重做**） |
| ADR | `docs/spdd/2-adr决策/ADR-20261109-trial-sse-llm-adapter.md` |
| 画布 | `docs/spdd/canvases/20261109-trial-sse-llm-adapter.md` |
| 分析 | `docs/spdd/analysis/20261109-portfolio-ai-highlights.md` |
| 既有计费条例 | `docs/spdd/4-测试条例/404home-deepseek-chat-cases.md` |
| 既有规范 | `docs/spdd/1-资产规范/404home-deepseek-chat.md` |

命令基线：

```bash
cd E:\AAAproject\AI_SPACE\404home
npm install
cd server && npm install
cd ..
npm test
npm run dev
```

---

## 2. 目标简历证据（做完必须能指到文件）

实现完成后，简历应能支撑下列句子（数字可手测后填）：

1. **服务端代理 + SSE 流式**：首包可见增量；Key 永不进前端。  
2. **统一 LLM 适配层**：DeepSeek 默认；第二 OpenAI 兼容 provider 可经 env 切换。  
3. **按分账本扣费**：流结束后 ledger `reason=chat`；余额不足 / 未配置有稳定 code。  
4. **工具 RAG + MCP**（已有）：双路+RRF+精排；`eval:recall`；三 MCP 工具——本批核对 README 路径仍可用即可。  
5. **可审查**：About/README「先看路径」+ ADR + `npm test`。

建议简历主句（实现后可微调）：

```text
404Home：Vue3+Koa 计费型 AI 试用（SSE 流式 / 多模型适配 / 账本扣费）
       + 工具库智能检索（双路召回 RRF + LLM 精排 + MCP）
```

---

## 3. 硬约束（违反即失败）

1. 保持栈：Vue3 + Koa + SQLite；**禁止**换 Nest/Next/Python。  
2. **禁止**前端直连任何 LLM；Key 只在 `server/.env`。  
3. **禁止**裸改 `users.balance_cents`；必须走 `chargeChat` / 账本。  
4. **禁止**破坏现有 `POST /api/chat/completions` 与 `chat-billing-p0`（TC-01/02/03/06 必须仍绿）。  
5. 单测 **禁止外网**：`DEEPSEEK_STUB=1`；第二 provider 同样要有 stub 或共用 stub。  
6. **禁止**实现：联网研究员、ChatBI、Multi-Agent、A2UI、微前端、全仓 TS、微信/支付。  
7. **禁止**重写智能检索主链路；Pillar B 只补文档/评测可复现缺口。  
8. Diff 精简：不顺手改资讯 CMS / 主题大改造。  
9. 资产序：若改行为，同步更新 `1-资产规范/404home-deepseek-chat.md` 与测试条例（去掉「阶段一非流式」）。  
10. 错误码优先兼容：`INSUFFICIENT_BALANCE`、`DEEPSEEK_NOT_CONFIGURED`；若引入 `LLM_NOT_CONFIGURED`，前端需同时识别旧码。

---

## 4. Pillar A · SSE + LLM 适配（主开发量）

### 4.1 目录与职责

```text
404home/server/services/llm/
  index.js          # export chat, chatStream, getStatus, listProviders
  providers.js      # 从 env 解析 providers
  openaiCompat.js   # OpenAI 兼容非流式 + SSE 解析
404home/server/services/deepseek.js
  # 保持 module.exports 形状：getConfig/isConfigured/usageToCents/chatCompletions
  # 内部改为委托 llm（避免全仓改 require）
404home/server/routes/chat.js
  # 新增 POST /api/chat/completions/stream
404home/server/test/chat-stream-p0.test.js
404home/src/api/index.js          # chatCompleteStream(...)
404home/src/composables/useTrialChat.js  # send 走 stream
```

### 4.2 Provider 配置（建议）

```bash
# server/.env.example 补充
LLM_DEFAULT_PROVIDER=deepseek
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-flash

# 第二 provider（OpenAI 兼容即可；名称可叫 secondary）
LLM_SECONDARY_API_KEY=
LLM_SECONDARY_BASE_URL=
LLM_SECONDARY_MODEL=
```

- `GET /api/chat/status` 增加：`provider`、`model`、`providers: string[]`（已配置的 id）。  
- 请求体可选 `provider`；非法或不存在 → `400` `code=INVALID_PROVIDER`。  
- 默认 `deepseek`；未配第二 key 时列表可只含 deepseek（Stub 下两者都可出现以便测切换）。

### 4.3 SSE 协议（必须按此实现）

`POST /api/chat/completions/stream`  
Headers：`Authorization: Bearer <userJWT>`；`Accept: text/event-stream`  
Body：`{ "message": "...", "sessionId": null|number, "provider": "deepseek"|... }`

事件（`text/event-stream`，每条 `data: <json>\n\n`）：

| event 字段建议 | 含义 |
| --- | --- |
| `{ "type":"meta", "sessionId":123 }` | 会话已确定（新建或续写） |
| `{ "type":"delta", "content":"..." }` | 增量文本（可多帧） |
| `{ "type":"done", "message":{ id, role, content, prompt_tokens, completion_tokens, cost_cents }, "charged_cents":n, "user":{...} }` | 结束；此时才扣费成功 |
| `{ "type":"error", "error":"...", "code":"..." }` | 失败；随后结束流 |

预检（开流前，用 JSON 非 SSE 也可，但推荐开流前直接 HTTP 错）：

- 空消息 → `400` `EMPTY_MESSAGE`  
- 过长 → `400` `MESSAGE_TOO_LONG`  
- 余额 ≤0 → `402` `INSUFFICIENT_BALANCE`  
- 未配置 → `503` `DEEPSEEK_NOT_CONFIGURED`（或兼容码）  
- 未登录 → `401`

### 4.4 扣费与中断

1. 开流前：校验余额 > 0、已配置；写入 **user** 消息（与现非流式一致）。  
2. 流式读上游；向客户端打 `delta`。  
3. **正常结束**：汇总 content + usage → 写 assistant 行 → `chargeChat(userId, cost_cents, \`msg_${assistantId}\`)` → 发 `done`。  
4. **上游失败**：发 `error`；不扣费（user 消息可保留或按现有非流式失败行为对齐，**须在规范写清并单测**）。  
5. **客户端断开**：停止读上游；若已有 partial content：  
   - **推荐（本批选定）**：仍落库 assistant（标记实际 content）+ 按 usage（无 usage 则 Stub 用已生成近似或 0 费用策略须文档化）扣费；**禁止负余额**。  
   - Stub 环境：可固定 usage，便于测。  
6. 幂等：同一 `msg_${id}` 不可双扣（wallet 层已有则复用）。

### 4.5 Stub 流式行为

`DEEPSEEK_STUB=1` 时：`chatStream` 分多片（例如 3～5 个 delta）吐出 `[stub] ...`，最后给出与现 `chatCompletions` 相同量级的 usage / `cost_cents`，保证扣费测试可断言余额下降。

### 4.6 前端

- `useTrialChat.send` 改为走 stream：本地先 push user；再 push 空 assistant，随 delta 追加；`done` 时写 id/cost、刷新 user 余额。  
- `error` / HTTP 错：展示与现网相同的文案（含 `DEEPSEEK_NOT_CONFIGURED` / `INSUFFICIENT_BALANCE`）。  
- 提供「停止生成」：`AbortController` abort fetch。  
- **不要**为流式重做整站视觉；沿用 Trial 现有风格。

### 4.7 自动化用例（新建）

文件：`404home/server/test/chat-stream-p0.test.js`  
环境：`DEEPSEEK_STUB=1`

| ID | 断言要点 |
| --- | --- |
| TC-S01 | 登录+有余额：SSE 收到 ≥1 个 delta + 最终 done；余额下降；ledger `chat` |
| TC-S02 | 余额 0：402 `INSUFFICIENT_BALANCE`（开流前） |
| TC-S03 | 无 Key 且非 Stub：503 `DEEPSEEK_NOT_CONFIGURED` |
| TC-S04 | 未登录：401 |
| TC-S05 | 非流式 `POST /completions` 仍扣费（回归，可调用既有 helper） |
| TC-S06 | （可选 P1）abort 后不出现负余额 |

同步更新 `docs/spdd/4-测试条例/404home-deepseek-chat-cases.md` 增加 TC-07=流式主路径 等条目。

---

## 5. Pillar B · 智能检索巩固（小改 / 核对）

**不要重写** RAG。完成核对清单即可：

- [x] `npm run reindex:tools`（在 server，按现 README）可跑  
- [x] `npm run eval:recall` 有 stdout 数字（本批 AVG Recall@5 ≈95%）  
- [x] `/smart-search` 页仍可用（`smart-search-p0` 绿）  
- [x] `mcp-server/README.md` 配置示例仍正确  
- [x] 根 `404home/README.md`「先看路径 B」与现状一致  

若发现文档漂移，只改文档/脚本提示，不改算法除非测试红。

---

## 6. Pillar C · 作品集叙事页

### 6.1 `About.vue` 改为作品集页

必备块（文案可用中文，语气克制，避免营销腔）：

1. **一句话定位**：可审查的计费型 AI 试用 + 工具智能检索（挂在导航宿主上）。  
2. **演示入口**：按钮/链接 → `/trial`、`/smart-search`。  
3. **技术亮点 3 条**（每条一行「主张」+ 一句「为何重要」），对应：流式计费、RAG/MCP、双角色 JWT 或账本用分。  
4. **非目标一句**：本窗口不做 ChatBI / Multi-Agent / 支付。  

保持现有 CSS 变量与 `card-panel` 风格；不要新设计体系。

### 6.2 `404home/README.md`

- 「先看路径 A」改为：**流式**试用（步骤里写清应看到逐字输出 + 余额下降）。  
- 技术亮点表增加一行：SSE 流式 + LLM 适配 → 链到 ADR-20261109 + `chat-stream-p0`。  
- 非目标列表与 ADR 一致。

---

## 7. 实现顺序（必须）

1. 读 ADR-20261109 + 本 HANDOFF + 现有 `chat.js` / `deepseek.js` / `useTrialChat.js`。  
2. 更新测试条例 → 写 `chat-stream-p0.test.js`（先红）。  
3. 实现 `services/llm/*`，改造 `deepseek.js` 委托。  
4. 实现 `POST /completions/stream` + 扣费。  
5. 前端 stream 消费 + 停止生成。  
6. 确认旧 `chat-billing-p0` 全绿。  
7. About + README（Pillar C）。  
8. Pillar B 核对清单。  
9. 全量 `npm test`；本地手测路径 A/B。  
10. 画布 Sync log 追加一行；可选写 `docs/spdd/rag/knowledge/404home-trial-sse.md`。

每完成一个大步，报告：改了哪些文件、测试结果、未决问题。

---

## 8. 验收清单（Done Definition）

- [x] TC-S01…S05 绿；旧 chat-billing P0 绿  
- [ ] 浏览器：登录 → `/trial` → 流式出字 → 余额下降（需本地手测）  
- [ ] 停止生成不炸、不负余额（需本地手测；自动化未强制 TC-S06）  
- [x] status 能显示 model；第二 provider 在 Stub 下列出 `secondary`  
- [x] `/smart-search` + eval 脚本仍可用  
- [x] About 是作品集页，含双入口  
- [x] README 先看路径已写流式  
- [x] 无密钥进 git；前端包无 API Key  
- [x] 规范已去掉「仅非流式」过时描述 

---

## 9. 明确不要做

- 不要引入 LangGraph/Python Agent 框架「为了简历好看」  
- 不要做多 Agent 周报 / Text-to-SQL BI  
- 不要全站换 Vite/TS  
- 不要把管理后台 CRUD 写成主角  
- 不要提交真实 `.env`  

---

## 10. 完成后回写

1. `docs/spdd/canvases/20261109-trial-sse-llm-adapter.md` Sync log 一行。  
2. 若 SSE 事件字段与本 HANDOFF 有意偏离：先改 ADR/规范再改代码叙事。  
3. 建议用户简历粘贴 §2 主句，并把 `eval:recall` 与流式演示录 30s 备面试。

---

## 11. 最小启动 Prompt（可追加在消息末尾）

```text
请严格按 E:\AAAproject\AI_SPACE\docs\spdd\canvases\20261109-portfolio-ai-highlights-HANDOFF.md 全文执行。
先读 ADR-20261109，再按 §7 顺序：先补 chat-stream-p0 红灯测试，再实现 SSE + llm 适配层。
禁止 Multi-Agent/ChatBI/换栈。每完成一步跑 npm test 并汇报。
```
