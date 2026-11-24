# HANDOFF · 给外部 AI 的实现说明书（404Home 工具 RAG + MCP）

> **用法**：把本文 **全文** 粘贴到另一 AI 平台作为系统/任务提示；仓库以本地路径为准实现代码。  
> **不要**另起技术栈；**不要**先做联网研究员 / BI / Multi-Agent。  
> 权威细节以同目录契约为准；冲突时以 **ADR + 本 HANDOFF + 测试条例** 为准。

---

## 0. 一句话任务

在现有 **404Home**（AI 工具导航 + DeepSeek 试用计费）上，增加 **工具智能检索（双路 + RRF + LLM 精排 top-5 + 命中理由）** 与 **MCP Server（3 个只读工具）**，使线上站与简历句对齐，且不破坏现有 CMS 搜索与 `/trial` 计费。

## 1. 仓库与路径

| 项 | 路径 |
| --- | --- |
| 代码根 | `E:\AAAproject\AI_SPACE\404home` |
| 前端 | Vue 3 + Vue Router + Vue CLI（`src/`） |
| 后端 | Koa + better-sqlite3（`server/`，入口 `server/index.js` / `app.js`） |
| 现有工具搜索 | `server/routes/tools.js` → `LIKE` on name/summary/tags |
| 现有 LLM 代理 | `server/services/deepseek.js`（`DEEPSEEK_STUB=1` 可离线） |
| tools 表字段 | `name, slug, summary, url, tags(JSON), pricing, region_avail, scenario, category_id, enabled, …`（见 `server/db.js`） |
| SPDD 契约根 | `E:\AAAproject\AI_SPACE\docs\spdd\` |
| 主画布 | `docs/spdd/canvases/20261105-tool-rag-mcp.md` |
| ADR | `docs/spdd/2-adr决策/ADR-20261105-tool-rag-mcp.md` |
| 测试条例 | `docs/spdd/4-测试条例/404home-tool-rag-mcp-cases.md`（TC-01…10） |
| 资产规范 | `docs/spdd/1-资产规范/404home-tool-rag-mcp.md` |

命令基线：

```bash
cd E:\AAAproject\AI_SPACE\404home
npm install
cd server && npm install
cd ..
npm test
npm run dev   # API :3001 + web :8080
```

## 2. 目标简历证据（实现必须可指到文件）

1. 按 **工具实体** 切分并向量化  
2. **双路各取 20** → **RRF 融合** → **LLM 精排 top-5 + reason**  
3. 脚本给出 **Recall@5 基线 vs 新链路**（数字可填简历）  
4. **MCP Server** 三工具，可写进 Cursor 配置  

## 3. 硬约束（违反即失败）

1. 保持栈：Vue3 + Koa + SQLite；密钥只进 `server/.env`。  
2. **禁止**改坏 `/api/tools` 的 LIKE 列表语义；新能力走 **`/api/smart-search`**。  
3. **禁止**动 `/trial` 计费主逻辑（可复用 `deepseek.js`）。  
4. **禁止**为「快」做成单路检索却声称双路 RRF。  
5. 单测 **禁止外网**：`EMBEDDING_STUB=1` + `DEEPSEEK_STUB=1`。  
6. 默认 **`VECTOR_BACKEND=sqlite`**（`tool_chunks` 表）；不要强依赖 Docker/Qdrant。  
7. 智能检索默认 **不扣费**；加 rate limit。  
8. 先写/补 `server/test/smart-search-p0.test.js` 覆盖 TC-01…08，再写实现（TDD）。  
9. 前端路由 **懒加载**；UI 最小：新页或明显入口即可，不重做视觉体系。  
10. MCP **只读**；工具名固定：`search_tools` | `get_tool_detail` | `list_tools_by_tag`。

## 4. 推荐目录与职责

```text
404home/server/
  services/
    embeddings.js      # OpenAI 兼容 + STUB
    toolChunker.js     # tool → chunks
    toolRetrieve.js    # keyword + vector + RRF
    toolRerank.js      # LLM JSON 精排 / 降级
    smartSearch.js     # 编排
  routes/smartSearch.js
  scripts/reindex-tools.js
  scripts/eval-recall-at-5.js
  data/eval/smart-search-golden.json
  test/smart-search-p0.test.js
404home/mcp-server/    # 独立 package，stdio MCP
404home/src/views/SmartSearch.vue
```

## 5. 算法规格（必须按此实现）

### 5.1 Chunk

对每个 `enabled=1` 的 tool，至少生成：

- `field=name` ← name  
- `field=summary` ← summary（可截断 500～1000 字）  
- `field=tags` ← tags 数组 join  
- `field=scenario` ← scenario（若空可跳过）  
- 可选 `field=card` ← `「${name}。${summary}。标签:${tags}」`

写入 `tool_chunks(tool_id, field, text, embedding_json, updated_at)`。

### 5.2 双路

- **Keyword**：对 chunk 或 tools 多字段 `LIKE %q%`，打分（例如 name 命中 > summary > tags），**按 tool_id 取最高分**，排序取 20。  
- **Vector**：`embed(q)` 与各 chunk 向量余弦相似度，按 tool_id 取最高分，取 20。  
- **RRF**：对两路排名列表，`score(d) = Σ 1/(k + rank_i)`，`k=60`；融合排序，候选池建议 top 40 进精排。

### 5.3 LLM 精排

Prompt 要求模型 **只输出 JSON 数组**：

```json
[{"tool_id": 1, "reason": "……"}, ...]
```

长度 ≤5；只能引用候选里的 id。解析失败 → 按 RRF 截断 5 条，`reason="精排降级：RRF"`，`meta.degraded=true`。

### 5.4 API

`POST /api/smart-search`

```json
// req
{ "q": "适合做海报的免费 AI", "rerank": true }

// res
{
  "items": [
    {
      "rank": 1,
      "score": 0.42,
      "reason": "……",
      "tool": { "id": 1, "name": "", "slug": "", "summary": "", "url": "", "tags": [] }
    }
  ],
  "meta": { "degraded": false, "keywordHits": 12, "vectorHits": 15, "rrfCandidates": 20 }
}
```

错误：

- 空 q → `400` `{ "error": "...", "code": "INVALID_QUERY" }`  
- 无 embedding 且非 stub → `503` `{ "code": "EMBEDDING_NOT_CONFIGURED" }`

### 5.5 评测

`server/data/eval/smart-search-golden.json`：≥20 条：

```json
[{ "query": "…", "relevant_tool_ids": [1, 2] }]
```

脚本对比：

- Baseline：现有 tools 列表接口逻辑（LIKE）的 top-5  
- New：smartSearch top-5  
- 指标：平均 Recall@5 = 命中 relevant 集合的比例  

打印清晰表格到 stdout。

### 5.6 MCP

| Tool | Args | Behavior |
| --- | --- | --- |
| `search_tools` | `query: string` | 调 smartSearch，返回精简 JSON |
| `get_tool_detail` | `idOrSlug: string` | 读 DB/API 单工具 |
| `list_tools_by_tag` | `tag: string` | 过滤 tags |

README 给出 Cursor 配置示例（`command` + `args` + cwd/env）。

## 6. 实现顺序（必须）

1. 测试骨架 + db 迁移 + chunker + embedding stub  
2. retrieve + RRF  
3. rerank + smartSearch 路由  
4. reindex CLI  
5. eval 脚本 + golden（可先用 seed 数据手写 20 条）  
6. `SmartSearch.vue` + 路由 + 入口  
7. `mcp-server`  
8. 更新 `404home/README.md` 增加「智能检索」演示 5 步  

每步完成后跑：`cd server && npm test`（及根目录 `npm test`）。

## 7. 验收清单（Done Definition）

- [ ] TC-01…08 自动化绿（stub 环境）  
- [ ] 浏览器打开智能检索页，输入自然语言，见 ≤5 条及 reason  
- [ ] `node server/scripts/eval-recall-at-5.js` 打出两个 Recall@5  
- [ ] MCP 三工具可 list；本地能 call  
- [ ] 原 `/search` 或 `/api/tools?q=` LIKE 仍可用  
- [ ] `/trial` 登录对话扣费仍可用  
- [ ] 无密钥进入前端包  

## 8. 明确不要做

- 不要引入 Nest/Next/Python FastAPI 替换现有 server  
- 不要全仓 TypeScript 化  
- 不要实现 Multi-Agent 周报  
- 不要在未开 ADR 的情况下改 JWT/钱包规则  
- 不要提交真实 `.env` / API Key  

## 9. 完成后回写

在 `docs/spdd/canvases/20261105-tool-rag-mcp.md` 的 Sync log 追加一行；把 eval 输出的两个百分比记到画布「Resume evidence mapping」。若实现与契约有意偏离，先改 ADR/规范再改代码叙事。

---

## 10. 最小 Prompt 后缀（可追加）

```text
请严格按 HANDOFF §6 顺序，在 E:\AAAproject\AI_SPACE\404home 落地。
先添加 server/test/smart-search-p0.test.js（TC-01~08），再写实现。
每完成一个 Op，跑 npm test 并报告结果。不要扩大范围。
```
