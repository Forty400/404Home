# ADR-20261105 · 工具智能检索（RAG + MCP）局部解冻

- Status: accepted
- Date: 2026-11-05
- Deciders: user + AI
- Related canvas: `docs/spdd/canvases/20261105-tool-rag-mcp.md`
- Related analysis: `docs/spdd/analysis/20261105-tool-rag-mcp.md`
- Supersedes: （局部）`ADR-20261015-portfolio-freeze.md` 中「窗口内冻结 … 多模型/Agent」就 **本模块** 的禁止条款
- Superseded by:

## Context

`ADR-20261015-portfolio-freeze` 将作品集主角定为 DeepSeek 试用计费，并冻结「多模型/Agent」扩张，以避免稀释可审查信号。当前求职叙事需要把 404Home 从「CRUD 导航站」升级为「可量化的检索 AI 应用 + Cursor MCP」，与冻结条款冲突。

## Decision

1. **局部解冻**：允许且仅允许落地 **工具库 RAG 智能检索 + MCP Server（3 tools）**，代码落在 `404home/` 既有栈内。
2. **叙事双主角**：`/trial` 计费闭环仍为第一主角；**智能检索 + MCP** 为第二主角（简历项目经历主句可写检索/MCP）。
3. **仍冻结**：联网研究员、ChatBI、Multi-Agent Supervisor、微前端、全仓 TS、Vite 全量迁移、微信/支付。后续若要做，另开 ADR。
4. **向量默认 SQLite**：`tool_chunks` 存文本与 embedding；双路 = 关键词（SQLite LIKE/FTS）+ 向量余弦；RRF 融合；LLM 精排 top-5。`VECTOR_BACKEND=qdrant` 为可选后续，不阻塞 P0。
5. **证据标准不变**：主张须链到规范 / 本 ADR / 自动化或可复现评测脚本。

## Consequences

**Positive**

- 站上能力与简历句对齐；面试可指文件与 Recall@5 脚本输出
- 不推翻现有 auth/wallet/chat 证据链

**Negative / Trade-offs**

- 引入 Embedding/LLM 依赖与索引运维
- 作品集窗口略增认知负担（需在 README 写清两条演示路径）

## Follow-ups

- [ ] 落地四层资产与画布 Ops
- [ ] `server/test/*rag*` / MCP 冒烟 + `scripts/eval-recall-at-5.js`
- [ ] 更新 `404home/README.md` 增加「智能检索」先看路径
- [ ] 摘要进 `docs/spdd/rag/knowledge/404home-tool-rag-mcp.md`
