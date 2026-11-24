# Analysis · 工具智能检索（RAG + MCP）

- Date: 2026-11-05
- Author: user + AI
- Status: ready
- Related canvas: `docs/spdd/canvases/20261105-tool-rag-mcp.md`

## 1. Problem

404Home（[forty40.online](http://forty40.online/)）当前工具搜索是 SQLite `LIKE` 关键词匹配（`server/routes/tools.js`）。作品集叙事若只写「独立完成前后台 CRUD + Cursor 辅助」，无法支撑「CRUD → AI 应用」的简历主张：实体切分向量化、双路召回 + RRF、LLM 精排 top-5 与命中理由、Recall@5 量化，以及 MCP Server 接入 Cursor。

不做则：站上能力与简历句不对齐；面试无法指到代码与评测证据。

## 2. Goals / Non-goals

**Goals**

- 将 `tools` 表实体化为可检索 chunk，落地双路召回 → RRF → LLM 精排 top-5 + reason。
- 提供可复现的 Recall@5 评测脚本（基线 LIKE vs 新链路），数字可填进简历。
- 独立 TypeScript/JS MCP Server，封装 3 个工具，可配置进 Cursor。
- 前台可演示（增强搜索页或独立 `/smart-search`），不破坏现有 LIKE 搜索与 `/trial` 计费主叙事。

**Non-goals（本变更不做）**

- 课时 5 联网研究员、课时 7 ChatBI、课时 8 Multi-Agent Supervisor。
- 多租户 JWT 文档隔离（课时 6 完整版）；本站单租户即可。
- Qdrant 强制上线（可选适配器，默认 SQLite 向量表以贴合现有部署）。
- 微前端 / 全仓 TypeScript / Vite 迁移。
- 替换 DeepSeek 试用计费主角地位（本模块为**第二主角**）。

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| 访客 | 自然语言找工具：「适合做海报的免费 AI」 | 看到 top-5 卡片 + 每条命中理由 |
| 求职面试官 | 打开仓库 / 跑评测 / 看 MCP 配置 | 能指到服务、评测数字、三个 MCP tools |
| 站长 | 工具增删改后重建索引 | `npm run reindex:tools` 成功；检索结果更新 |
| Cursor 用户 | 本地挂 MCP | 用自然语言检索本站工具库 |

## 4. Constraints

- Tech: 保持 Vue 3 + Koa + SQLite；API 在 `404home/server`；密钥仅 env。
- Time: 以 P0 可演示闭环优先；Rerank 可用 DeepSeek Stub / Mock 跑通测试。
- Ops / security: 不把 Embedding / LLM Key 打进前端；MCP 默认真读；限流防刷。

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Embedding 服务不稳定 / 需翻墙 | 索引失败 | OpenAI 兼容多 provider（硅基流动等）；离线 fixture 向量测链路 |
| LLM 精排贵 / 慢 | 成本与体验 | 仅对 RRF 融合后 ≤40 条精排；可关精排降级到 RRF top-5；可选扣钱包 |
| 与 portfolio-freeze「禁止 Agent」冲突 | 叙事分裂 | 新 ADR 局部解冻，明确范围 |
| 评测集过小导致数字不可信 | 简历翻车 | ≥20 条 golden query；脚本输出基线对比表 |

## 6. Open Questions

- [x] 向量库：默认 SQLite `tool_chunks` + 内存/磁盘余弦；接口预留 `VECTOR_BACKEND=sqlite|qdrant`
- [x] 计费：智能检索默认**不扣费**（作品集演示），用 IP/user 限流；env 可开 `SMART_SEARCH_BILLING=1` 走钱包
- [ ] 线上 Embedding 具体 provider 由部署者填 env（文档给示例）

## 7. Recommended Next

→ 已生成 REASONS Canvas：`docs/spdd/canvases/20261105-tool-rag-mcp.md`  
→ 给外部 AI 的粘贴包：`docs/spdd/canvases/20261105-tool-rag-mcp-HANDOFF.md`
