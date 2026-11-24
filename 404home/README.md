# 404Home

**可审查的计费型 AI 试用（SSE 流式）**（挂在 AI 工具导航宿主上）——面向资深 / 全栈前端的工程作品集切片。

一句话：用户注册登录后，在 `/trial` 经**服务端代理 + SSE** 流式调用模型，按 token 折合「分」扣余额；统一 LLM 适配层（DeepSeek 默认 + 可配第二 OpenAI 兼容端）；双角色 JWT、账本、密钥不进前端。导航 CMS 是背景。**第二主角**：工具库智能检索（RAG + MCP），见下方路径 B。

仓库：https://github.com/Forty400/404Home  
工程契约（SPDD）：[../docs/spdd/README.md](../docs/spdd/README.md)  
智能检索技术说明：[docs/智能检索-技术说明.md](./docs/智能检索-技术说明.md)

## 先看路径 A · 流式试用（约 5 步）

1. `npm install`（本目录）与 `cd server && npm install`
2. `npm run dev`（或分别起 API `:3001` + 前台 `:8080`）
3. 打开前台 → **DeepSeek 试用**（`/trial`）→ 注册/登录（注册赠 **¥3 = 300 分**）
4. 发送一条消息，应看到：
   - **逐字 / 逐块** SSE 增量输出（非整段一次性弹出）
   - 结束后 **余额 chip 下降**，提示已扣费（ledger `reason=chat`）
   - 未配置 Key → 明确错误码 **`DEEPSEEK_NOT_CONFIGURED`**（仍可讲「Key 仅服务端」）
   - 生成中可点 **停止生成**（AbortController；不出现负余额）
5. （可选）`/admin` 默认 `admin` / `admin123` → 用户管理加额恢复额度（走账本，非裸改余额）

## 先看路径 B · 智能检索（约 5 步）

1. `cd server`，`.env` 可设 `EMBEDDING_STUB=1` + `DEEPSEEK_STUB=1`（无 Key 也能演示）
2. `npm run reindex:tools` 重建 `tool_chunks`
3. 根目录 `npm run dev` → 打开 **智能检索**（`/smart-search`）
4. 输入自然语言（如「适合做海报的免费 AI」）→ 见 ≤5 条结果与 `reason`
5. （可选）`npm run eval:recall` 打印 LIKE 基线 vs 新链路 Recall@5；MCP 见 [`mcp-server/README.md`](./mcp-server/README.md)

自动化：`npm test`（前端 vitest + 服务端 node:test，含 auth / wallet / chat / **smart-search** P0）。

## 架构简图

| 层 | 技术 | 职责 |
| --- | --- | --- |
| 前台 | Vue 3、Vue Router、Vue CLI | 导航宿主 + AuthModal + `/trial` |
| API | Koa、JWT、`userRequired` / `adminRequired` | 代理 DeepSeek、钱包、CMS |
| DB | SQLite（better-sqlite3） | users / wallet_ledger / chat_* / tools… |

```text
Browser ──/api/chat/completions/stream (SSE)──► Koa ── llm adapter ──► DeepSeek / secondary
                │
                └── chargeChat → wallet_ledger (reason=chat)
```

## 技术亮点 → 证据链

| 主张 | 规范 | ADR / 决策 | 自动化 / 手测 |
| --- | --- | --- | --- |
| user / admin JWT 分离，禁止互冒 | [auth](../docs/spdd/1-资产规范/404home-auth.md) · [architecture](../docs/spdd/1-资产规范/404home-architecture.md) | 资产分层与模块回填 | `server/test/user-auth.test.js` TC-09 |
| 金额用分；改余额走账本 | [wallet](../docs/spdd/1-资产规范/404home-wallet.md) | [portfolio-freeze](../docs/spdd/2-adr决策/ADR-20261015-portfolio-freeze.md) | `server/test/wallet-p0.test.js` TC-02/03/04 |
| 登录缓存只存邮箱、不存密码 | [auth](../docs/spdd/1-资产规范/404home-auth.md) | [login-cache](../docs/spdd/2-adr决策/ADR-20261013-login-cache-email-only.md) | `src/composables/useLoginCache.spec.js` |
| 聊天仅服务端代理；无 Key / 余额不足有 code | [deepseek-chat](../docs/spdd/1-资产规范/404home-deepseek-chat.md) | [test-stack](../docs/spdd/2-adr决策/ADR-20261013-test-stack.md) | `server/test/chat-billing-p0.test.js` TC-01/02/03/06；前端不直连为**手测** |
| SSE 流式 + LLM 适配层（≥2 provider 可配） | [deepseek-chat](../docs/spdd/1-资产规范/404home-deepseek-chat.md) | [ADR-20261109](../docs/spdd/2-adr决策/ADR-20261109-trial-sse-llm-adapter.md) | `server/test/chat-stream-p0.test.js` TC-S01…S05 |
| 作品集窗口聚焦试用计费，冻结低信号扩张 | architecture 对外叙事段 | [portfolio-freeze](../docs/spdd/2-adr决策/ADR-20261015-portfolio-freeze.md)；流式局部解冻见 ADR-20261109 | 本 README · `/about` |
| 工具实体切分 + 双路 RRF + LLM 精排 + MCP | [tool-rag-mcp](../docs/spdd/1-资产规范/404home-tool-rag-mcp.md) | [ADR-20261105](../docs/spdd/2-adr决策/ADR-20261105-tool-rag-mcp.md) | `server/test/smart-search-p0.test.js`；`npm run eval:recall` |
| 路由懒加载；入口 vendor gzip **46.20 KiB**，`/trial` JS gzip **3.13 KiB**（2026-10-18 build） | architecture 规则 11 | [perf-baseline](../docs/spdd/2-adr决策/ADR-20261015-perf-baseline.md) | `npm run build` 输出；无 Lighthouse 门禁 |

面试可口述的 3 个深故事：双角色 JWT、分账用分、邮箱缓存——上表可直接指到文件。

## 非目标（当前作品集窗口）

- 微信登录 / 支付、短信、小程序
- 资讯运营扩张、联网研究员 / ChatBI / Multi-Agent / A2UI、微前端、全仓 TypeScript
- 以管理后台 CRUD 当主线演示
- （例外）工具 RAG + MCP 已由 [ADR-20261105](../docs/spdd/2-adr决策/ADR-20261105-tool-rag-mcp.md) 局部解冻；Trial SSE + LLM 适配由 [ADR-20261109](../docs/spdd/2-adr决策/ADR-20261109-trial-sse-llm-adapter.md) 局部解冻

详见 [ADR-20261015-portfolio-freeze](../docs/spdd/2-adr决策/ADR-20261015-portfolio-freeze.md)、[ADR-20261109](../docs/spdd/2-adr决策/ADR-20261109-trial-sse-llm-adapter.md)。

## 环境要求

- Node.js 18+（推荐 LTS）
- npm 8+

## 快速开始

```bash
# 1. 安装前端依赖（在 404home 目录）
npm install

# 2. 安装后端依赖
cd server
npm install
# 可选：复制 .env.example → .env，填入 DEEPSEEK_API_KEY

# 3. 根目录一键并行
cd ..
npm run dev
# 前台 http://localhost:8080 · API http://localhost:3001
```

本地测计费闭环可不配真实 Key：服务端测试使用 `DEEPSEEK_STUB=1`（见 `server/services/deepseek.js`），**禁止把 Stub 当生产上游**。

## 管理后台

- 地址：http://localhost:8080/admin
- 默认账号：`admin` / `admin123`（见 `server/.env`，生产请修改）
- 用途：工具/分类/文章 CMS；**用户加额**（作品集演示恢复额度）

## 用户测试 / 评价（UAT）

- 指导与权限矩阵：[`docs/spdd/1-资产规范/404home-uat-guide.md`](../docs/spdd/1-资产规范/404home-uat-guide.md)
- 本地口令配置：复制 `uat.local.example.md` → `uat.local.md`（已 gitignore）
- C 端固定测评号（seed）：`uat@404home.test` / 见 `UAT_USER_PASSWORD`（默认 `Uat404Home!`）
- 默认评价轮**可不测 DeepSeek**；清单含 UX-01～10 手测项

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run serve` | 前台开发服务器 |
| `npm run build` | 前台生产构建 |
| `npm run lint` | 代码检查 |
| `npm run server` | 启动 Koa API |
| `npm run dev` | 同时启动前台与 API |
| `npm test` | 前端单测 + 服务端 P0（auth/wallet/chat） |

## 目录结构

```
404home/
├── src/
│   ├── api/
│   ├── components/       # 含 AuthModal
│   ├── composables/      # useLoginCache 等（含单测）
│   ├── layouts/
│   ├── router/
│   ├── views/            # Trial.vue = 作品集主路径
│   └── …
├── server/
│   ├── routes/           # userAuth / chat / wallet / CMS…
│   ├── services/         # deepseek / wallet
│   ├── test/             # node:test P0
│   ├── db.js
│   └── .env.example
└── package.json
```

## API 要点（作品集相关）

- `POST /api/user/register` · `POST /api/user/login` · `GET /api/user/me`
- `POST /api/chat/completions`（user JWT；错误码 `INSUFFICIENT_BALANCE` / `DEEPSEEK_NOT_CONFIGURED`）
- `GET /api/chat/sessions` · messages
- `POST /api/wallet/admin-credit`（**仅 admin JWT**）
- CMS：`/api/categories` · `/api/tools` · `/api/posts` · `POST /api/auth/login`

开发环境下，前台通过 `vue.config.js` 将 `/api` 代理到后端。

## 浏览器支持

- 全球使用率 > 1%
- 最近 2 个版本
- 不支持 IE 11

## 附录：SPDD

本仓库用结构化提示驱动开发（分析 → 画布 → ADR → 测试边界/条例 → 规范 → 代码）。入口：[../docs/spdd/README.md](../docs/spdd/README.md)。AI 协作是加速器；对外主叙事仍是可运行的计费与鉴权边界。

## 许可证

Private
