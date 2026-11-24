# 测试条例 · 工具智能检索（RAG + MCP）

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261105-tool-rag-mcp.md`
- Related boundary: `docs/spdd/3-测试边界/404home-tool-rag-mcp.md`
- Related canvas: `docs/spdd/canvases/20261105-tool-rag-mcp.md`
- Code tests: `404home/server/test/smart-search-p0.test.js`（实现时创建）
- Updated: 2026-11-05

## Cases

### TC-01 · 实体切分产生多 chunk

- Priority: P0
- **Given**: 一条 tool，含 name、summary、tags、scenario 非空
- **When**: 调用 chunker
- **Then**: 返回 ≥2 条 chunk；每条含 `tool_id`、`field`、`text`；文本非空
- **Notes**:

### TC-02 · Stub embedding 稳定

- Priority: P0
- **Given**: `EMBEDDING_STUB=1`
- **When**: 对同一字符串 embed 两次
- **Then**: 向量长度一致且逐维相等
- **Notes**:

### TC-03 · 双路 RRF 融合且 tool 去重

- Priority: P0
- **Given**: 库中 ≥3 个 tool；query 能命中至少 1 个
- **When**: retrieve + RRF（`RETRIEVE_K=20`）
- **Then**: 结果按 score 降序；同一 `tool_id` 至多一次；长度 ≤40（或约定候选上限）
- **Notes**:

### TC-04 · LLM 精排输出 top-5 与 reason

- Priority: P0
- **Given**: Stub LLM 返回合法 JSON 五条
- **When**: smartSearch
- **Then**: `items.length ≤ 5`；每条有非空 `reason`；含可序列化 tool 摘要（id/name/slug）
- **Notes**:

### TC-05 · 精排失败降级 RRF

- Priority: P0
- **Given**: Rerank 抛错或返回非法 JSON
- **When**: smartSearch
- **Then**: 仍返回 ≤5 条；`reason` 含降级说明或 `meta.degraded=true`
- **Notes**:

### TC-06 · 空查询拒绝

- Priority: P0
- **Given**: `q` 为空或仅空白
- **When**: `POST /api/smart-search`
- **Then**: HTTP 400，`code=INVALID_QUERY`
- **Notes**:

### TC-07 · Embedding 未配置且非 stub

- Priority: P1
- **Given**: 无 `EMBEDDING_API_KEY` 且 `EMBEDDING_STUB≠1`
- **When**: 需要向量路的 smartSearch 或 reindex
- **Then**: 503，`code=EMBEDDING_NOT_CONFIGURED`（或仅关键词路 + `meta.warnings`——若选后者须在规范写死；**默认采用 503**）
- **Notes**: 实现选定一种后更新本条与规范保持一致

### TC-08 · 无命中返回空列表而非 500

- Priority: P0
- **Given**: query 极不可能命中（如随机 UUID）
- **When**: smartSearch
- **Then**: 200，`items=[]`
- **Notes**:

### TC-09 · Recall 脚本可运行

- Priority: P1
- **Given**: golden 文件存在；stub 环境；已 seed 若干 tools
- **When**: 运行 `eval-recall-at-5.js`
- **Then**: exit 0；stdout 含 `Recall@5` 与基线/新链路两个数值
- **Notes**: 不强制新链路更高，但必须算出数

### TC-10 · MCP 三工具注册（可选）

- Priority: P2
- **Given**: mcp-server 已安装依赖
- **When**: 列出 tools
- **Then**: 名称包含 `search_tools`、`get_tool_detail`、`list_tools_by_tag`
- **Notes**: CI 可 skip

## Traceability

| Case | Boundary section | Spec / ADR |
| --- | --- | --- |
| TC-01–03 | In scope 切分/RRF | ADR-20261105；资产规范 §2 |
| TC-04–05 | Rerank 热点 | 画布 A/S |
| TC-06–08 | API 错误 | 资产规范 |
| TC-09 | Eval | 简历证据 |
| TC-10 | MCP | 画布 Op7 |
