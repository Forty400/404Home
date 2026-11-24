# 规范 · 404Home 架构基线

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261015-portfolio-freeze.md`；`ADR-20261015-perf-baseline.md`；`ADR-20261021-spdd-superpowers-ponytail.md`
- Related canvas: `docs/spdd/canvases/20261013-portfolio-tech-showcase.md`；`docs/spdd/canvases/20261007-deepseek-trial-roadmap.md`（纲领）；`docs/spdd/canvases/20261021-arch-slim-agent-stack.md`
- Related tests: `3-测试边界/404home-architecture.md` · `4-测试条例/404home-architecture-cases.md`
- Updated: 2026-10-21
- Source confidence: high（overview + trial 画布/分析）

## 1. Scope

覆盖全站技术栈、目录、角色边界与跨模块硬约束。不含单页 UI 细则（见各功能规范）与部署密钥（见 `deploy.local.md` / RAG deploy）。

**对外叙事（作品集窗口）**：第一主角为 **DeepSeek 试用计费闭环**（`/trial`）；第二主角为 **工具智能检索 + MCP**（见 `ADR-20261105-tool-rag-mcp.md`）；AI 工具导航 CMS 为宿主背景。全局冻结条款见 `ADR-20261015-portfolio-freeze.md`（已被 20261105 ADR **局部解冻** Agent/RAG 本模块）。

## 2. Rules

1. 栈：前台 Vue 3 + Vue Router；后端 Koa + koa-router + JWT；DB SQLite（better-sqlite3）。
2. 目录：前端 `404home/`；API `404home/server/`（入口 `index.js`）；开发代理 `/api` → `localhost:3001`。
3. CMS 数据模型基线：`categories` / `tools` / `posts`（`type` news|tutorial；扩展 `topic` plugin|dev|method|news、`source_name`/`source_url`、`is_hot`、`cover`）/ `admins`；工具 URL、热门与文章等后台/seed 配置，**禁止前端写死工具或文章列表**。宿主首页 IA 见 `ADR-20261021-hot-articles-home`。
4. C 端能力（用户/钱包/聊天）是**增量模块**，不替换 `/admin` CMS，不改写主导航信息架构；前台 Header **不展示**「管理」入口（直访 `/admin` 仍可用）。
5. 双角色 JWT：`role: user` 与 `role: admin` 分离；中间件 `userRequired` / `adminRequired`；**禁止跨角色冒用**。
6. 金额一律**整数分（cents）**存储与结算；余额不可为负；改余额必须走账本，禁止裸 `UPDATE users SET balance`。
7. API 错误体优先 `{ error, code? }`；未认证 `401`；余额不足用 `INSUFFICIENT_BALANCE`（或约定 402）。
8. 第三方密钥（DeepSeek / 微信 / 邮件等）仅服务器 env / 私密部署文件，**禁止进前端或 git**。
9. 开发阶段禁止自动改服务器 SSH 密码。
10. 主导航「首页」链到 `/`：仅用 **exact** 激活样式（`active-class=""` + `exact-active-class="router-link-active"`），避免全站常驻高亮。
11. **路由懒加载（作品集期保持）**：`src/router/index.js` 页面与布局使用 `() => import(...)`。生产基线见 `ADR-20261015-perf-baseline.md`（2026-10-18）：入口 vendor gzip **46.20 KiB** + app gzip **4.71 KiB**；`/trial` JS gzip **3.13 KiB**。禁止把 Trial/Admin 页面改回静态 import。
12. **协作栈（Agent）**：设计契约走 SPDD；实现必循入仓 Superpowers `test-driven-development`；产出受 Ponytail 约束（最少必要代码）。有活跃画布时不启用 Superpowers brainstorm/writing-plans。详见 `ADR-20261021-spdd-superpowers-ponytail.md`。

## 3. Examples

**Good**

- 新工具字段走 admin CRUD + DB，前台只读 API。
- Trial 调 `POST /api/chat/completions`（带 user JWT），由服务端代理 DeepSeek。

**Bad**

- 在 Vue 组件里硬编码热门工具 URL。
- 用 admin token 调 `/api/user/*` 或 chat 用户接口。

## 4. Enforcement

- Review / Skill：改 `404home/**` 时对照本规范 + `.cursor/rules/404home-conventions.mdc`。
- 违反：先补 ADR/规范再改代码，或按规范改回。
- RAG 摘要：`docs/spdd/rag/knowledge/404home-overview.md`
