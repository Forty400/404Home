# 测试边界 · 工具智能检索（RAG + MCP）

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261105-tool-rag-mcp.md`
- Related canvas: `docs/spdd/canvases/20261105-tool-rag-mcp.md`
- Related 条例: `docs/spdd/4-测试条例/404home-tool-rag-mcp-cases.md`
- Updated: 2026-11-05

## 1. System under test

- `404home/server/services/toolChunker.js`
- `404home/server/services/embeddings.js`
- `404home/server/services/toolRetrieve.js`
- `404home/server/services/toolRerank.js`
- `404home/server/services/smartSearch.js`
- `404home/server/routes/smartSearch.js`
- `404home/server/scripts/eval-recall-at-5.js`（冒烟：可执行）
- `404home/mcp-server`（可选：tools/list 冒烟；CI 可跳过若未装依赖）

## 2. In scope

- Chunk 切分与 stub embedding 稳定性
- 双路召回 + RRF 融合与 tool 去重
- 精排成功 / JSON 失败降级
- HTTP API 校验与错误码
- 空库 / 无命中行为
- Recall 脚本在 fixture DB 上不崩溃并打印两行指标

## 3. Out of scope（刻意不测）

- 真实 Embedding / DeepSeek 外网质量
- Cursor IDE 真实联调（手测）
- Qdrant backend
- 前端像素 / E2E（手测演示路径即可）
- 计费开启时的完整钱包矩阵（若实现 billing，最少 1 条「扣费走 ledger」；默认关闭则不测）

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| Rerank JSON 解析 | LLM 不稳定导致空结果 | 强制降级路径单测 |
| Tool 去重 | 多 chunk 同工具刷屏 | 融合后同 tool 只出现一次 |
| Stub 向量 | 测试闪烁 | 同输入同输出 |
| 空 query | 乱打上游 | 400 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| Embedding API | Stub | `EMBEDDING_STUB=1` |
| DeepSeek chat | Stub | `DEEPSEEK_STUB=1`；rerank 可再加纯函数 mock |
| SQLite | Real temp DB | 沿用 `server/test/helpers.js` 模式 |
| MCP SDK | 可选 | 无则 skip |

## 6. Environments

- Local: stub 全开
- CI: stub 全开；禁外网
- Forbidden in unit/integration: 真实付费 API 调用
