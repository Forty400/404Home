# Analysis · 作品集 AI 含金量升级（一旗舰三柱）

- Date: 2026-11-09
- Author: user + AI（来自 AILearning 求职补强对齐）
- Status: ready
- Related canvas: `docs/spdd/canvases/20261109-trial-sse-llm-adapter.md`
- Related handoff: `docs/spdd/canvases/20261109-portfolio-ai-highlights-HANDOFF.md`
- Related ADR: `docs/spdd/2-adr决策/ADR-20261109-trial-sse-llm-adapter.md`

## 1. Problem

HR/面试反馈：前端候选人缺 AI 项目经验。课程侧有 Vue 助手 / RAG 客服 / Multi-Agent 等实战，但 404Home 已具备更强的「可审查产品」底座。若另起课设仓，会稀释 SPDD 证据链；若只改文案，含金量不够。

## 2. Goals / Non-goals

**Goals**

- 把 **404Home 打成唯一旗舰项目**：简历主写 1 个，深挖 3 柱。
- Pillar A：Trial **SSE 流式 + LLM 适配层（≥2 provider 可配）+ 扣费一致**。
- Pillar B：巩固智能检索（评测可复现、MCP 可演示）——多数已在 ADR-20261105，本批只补缺口。
- Pillar C：About/README **作品集叙事**，每条亮点可指文件。

**Non-goals**

- 联网研究员、ChatBI、Multi-Agent、A2UI 全套、微前端、全仓 TS、微信支付。
- 另起玩具 Demo 仓库。

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| HR / 一面 | 扫简历项目句 | 能立刻感到「做过 AI 产品」而非「调过 ChatGPT」 |
| 资深前端 | 打开站 / 仓库 15min | 能追到 SSE、账本、RAG 评测、MCP |
| 本人面试口述 | 讲 3 个深故事 | JWT / 账本分 / 流式扣费或 RAG 取舍 |

## 4. Constraints

- 遵守栈：Vue3 + Koa + SQLite；密钥仅 `server/.env`。
- 不破坏现有 `POST /api/chat/completions` P0 与 wallet 不变量。
- 单测禁止外网：`DEEPSEEK_STUB=1`（及新 provider stub）。

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 流式扣费竞态 / 断线双扣 | 账本错乱 | 明确幂等键；条例覆盖 abort；先测后码 |
| 范围膨胀到 Multi-Agent | 信号稀释 | ADR 硬冻结；HANDOFF 禁止清单 |
| 只改 UI 文案 | 简历仍虚 | Done Definition 绑定自动化 + 演示路径 |

## 6. Open Questions

- [x] 是否保留非流式 completions：是（兼容 + 回归）
- [x] 第二模型：env 可配 OpenAI 兼容端点即可，不绑定具体品牌 UI 文案
- [ ] 线上 Demo 额度与真实 Embedding Key：实现期用 Stub；上线前运维配置

## 7. Recommended Next

→ 实现 AI **只读 HANDOFF 全文**作为任务契约；按 §6 顺序开发。
