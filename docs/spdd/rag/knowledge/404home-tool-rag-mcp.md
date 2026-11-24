# 404Home 工具智能检索（RAG + MCP）

- Date: 2026-11-05
- Code: `404home/server/services/{toolChunker,embeddings,toolRetrieve,toolRerank,smartSearch,toolIndex}.js`
- API: `POST /api/smart-search`；UI: `/smart-search`；MCP: `404home/mcp-server`
- Spec: `1-资产规范/404home-tool-rag-mcp.md`；ADR-20261105；画布 `canvases/20261105-tool-rag-mcp.md`
- Tech doc: `404home/docs/智能检索-技术说明.md`

## Facts

- 默认向量后端 SQLite `tool_chunks`；双路各 top-20 → RRF(k=60) → LLM 精排 top-5 + reason；失败降级 RRF。
- 不改 `/api/tools` LIKE；默认不扣费；单测 `EMBEDDING_STUB=1` + `DEEPSEEK_STUB=1`。
- 评测：`npm run eval:recall`（golden ≥20）。Stub 环境示例：Recall@5 约 25% → 95%（以本机 stdout 为准）。
- MCP 三工具：`search_tools` / `get_tool_detail` / `list_tools_by_tag`（HTTP → 本机 API）。
