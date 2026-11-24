# 规范 · 工具智能检索（RAG + MCP）

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261105-tool-rag-mcp.md`
- Related canvas: `docs/spdd/canvases/20261105-tool-rag-mcp.md`
- Related tests: `3-测试边界/404home-tool-rag-mcp.md` · `4-测试条例/404home-tool-rag-mcp-cases.md`
- Updated: 2026-11-05
- Source confidence: medium（规范先行，代码待落地）

## 1. Scope

覆盖工具库的切分、向量化、双路检索、RRF、LLM 精排、HTTP API、评测脚本与 MCP Server。  
不含：原 `/api/tools` LIKE CMS 列表语义、联网 Agent、ChatBI、Multi-Agent、`/trial` 计费规则变更。

## 2. Rules

1. **实体切分**：以 `tools` 行为实体，按字段生成 `tool_chunks`；禁止整站单文档糊进向量库。
2. **双路召回**：关键词路与向量路各取 `RETRIEVE_K`（默认 20）条（tool 级去重后），再 **RRF**（`k` 默认 60）融合。
3. **精排**：对融合候选做 LLM 精排，输出 **top-5** 与每条非空 **`reason`**；失败必须降级为 RRF 顺序，禁止 500 吞没。
4. **API**：`POST /api/smart-search`；请求 `{ q, rerank? }`；响应 `{ items, meta }`；`items[i]` 含 tool 摘要、`score`、`reason`。
5. **密钥**：Embedding / LLM Key 仅服务器 env；前端禁止持有。
6. **Stub**：测试与 CI 必须可用 `EMBEDDING_STUB=1`、`DEEPSEEK_STUB=1` 全离线跑通。
7. **默认向量后端**：`VECTOR_BACKEND=sqlite`；Qdrant 仅可选，未实现时不得假装已接通。
8. **计费默认关**：`SMART_SEARCH_BILLING=0`；若开启必须走 wallet ledger（`reason=smart_search`）。
9. **MCP**：独立包，只读三工具：`search_tools`、`get_tool_detail`、`list_tools_by_tag`；不得暴露写库/admin。
10. **兼容**：不得破坏现有 `/api/tools` LIKE 与 `/trial` 计费闭环。
11. **证据**：对外宣称 Recall@5 提升必须来自 `eval-recall-at-5.js`（或后续同等脚本）对 golden 集的输出。

## 3. Examples

**Good**

- 查询「免费做海报」返回 ≤5 个工具，每条带中文命中理由。
- 精排 JSON 坏了仍返回 RRF 结果，`meta.degraded=true`。

**Bad**

- 前端直连 Embedding API。
- 简历写双路 RRF，代码只有单路向量。
- MCP 提供 `delete_tool`。

## 4. Enforcement

- Review：对照本规范 + 画布 Op；`npm test` 含 smart-search P0。
- 违反：先改契约/测试再改代码，或按规范改回。
