# REASONS Canvas · 静默采集 + 审稿 / 回收站

- Date: 2026-11-25
- Status: active
- Related analysis: `docs/spdd/analysis/20261125-article-ingest-review.md`
- Related ADR: `docs/spdd/2-adr决策/ADR-20261125-article-ingest-review.md`
- Related tests: `docs/spdd/3-测试边界/404home-article-ingest-review.md` · `docs/spdd/4-测试条例/404home-article-ingest-review-cases.md`
- Code anchors: `404home/server/db.js` · `routes/posts.js` · `ingest/` · `src/views/admin/Post*.vue`

---

## R · Requirements（为什么、范围）

### Business goal

机器静默抓公开素材整理进待审；编辑审稿、手动发布；过期文下线回收站并可硬删。

### In scope

- lifecycle 四态 + 公共过滤
- approve / publish / archive / restore / fork / delete
- 待审 ≥20 闸门；约 5/天配额（脚本）
- Admin 待审 / 写稿 / 回收站
- News + GitHub 采集骨架（规则拼装、只读）

### Out of scope

- LLM 润色；源站互动；完整反爬；所见即所得富文本组件库

### Acceptance criteria

- [x] 条例 TC-01～07 自动化通过
- [x] admin 三入口可操作主路径
- [x] `node server/ingest/run.js --dry-run` 可跑且无外部写操作

---

## E · Entities（领域对象）

| Entity | Fields / meaning | Persistence |
| --- | --- | --- |
| Post | + `lifecycle`, `ingest_bot` | SQLite `posts` |
| IngestJob | 源配置、日配额、闸门 | `ingest/config.example.json` + env |

---

## A · Approach（方案与取舍）

### Chosen approach

`lifecycle` 真源 + `published` 同步；采集经 API；admin 三页；textarea 写稿（`##` 标题）。

### Alternatives considered

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| 仅用 published 0/1 | 简单 | 无法表达待审/回收站 | 否 |
| 独立中台服务 | 隔离 | 过重 | 否 |

---

## S · Structure（结构与依赖）

### Modules / files to touch

| Path | Change |
| --- | --- |
| `404home/server/db.js` | migrate lifecycle / ingest_bot |
| `404home/server/routes/posts.js` | 过滤与动作 API |
| `404home/server/test/article-ingest-review-p0.test.js` | P0 |
| `404home/server/ingest/*` | 静默采集骨架 |
| `404home/src/views/admin/PostReview.vue` 等 | 三页 |
| `404home/src/router/index.js` · `AdminLayout.vue` · `api/index.js` | 接线 |
| `docs/spdd/1-资产规范/404home-architecture.md` | CMS 字段 |

### Dependencies / order

1. 测试红 → DB/API 绿 → admin → ingest 骨架 → 规范/RAG

---

## O · Operations（有序实现步骤）

### Op 1 · 失败用例

- **Files**: `404home/server/test/article-ingest-review-p0.test.js`
- **Do**: 按条例 TC-01～07 写测
- **Done when**: 红（缺 API/字段）

### Op 2 · Schema + 生命周期 API

- **Files**: `db.js` · `routes/posts.js` · `seed.js`（回填 lifecycle）
- **Do**: 列迁移；动作路由；公共过滤；闸门；fork
- **Done when**: TC-01～06 绿

### Op 3 · Admin 三页

- **Files**: `PostReview.vue` · `PostEditor.vue` · `PostTrash.vue` · router · AdminLayout · api
- **Do**: 待审操作、写稿保存/发布、回收站恢复/硬删；旧 posts 链到总览或保留列表
- **Done when**: 手测主路径 + 路由存在源码断言（可并入 TC 或轻量）

### Op 4 · 采集骨架

- **Files**: `server/ingest/run.js` · `assemble.js` · `config.example.json` · `.env.example`
- **Do**: dry-run/限流/闸门；只读 fetch；TC-07
- **Done when**: TC-07 绿；dry-run 退出 0

### Op 5 · 规范收尾

- **Files**: `1-资产规范/404home-architecture.md` · 边界 README · analysis status
- **Do**: 记下 lifecycle；索引
- **Done when**: 文档与行为一致

---

## N · Norms（怎么写）

- Stack: Vue3 / Koa / SQLite；不新增富文本依赖
- API: `{ error, code? }`；闸门 `code=pending_backlog_full`（429）
- UI: admin 侧栏中文；写稿用 textarea
- Testing: node:test；TDD

---

## S · Safeguards（不许做什么）

- Must not: 未审自动 published；公共 API 返回 archived/pending；采集对源站写
- Security: 动作需 admin；INGEST_TOKEN 可选；无 XSS v-html 正文
- Rollback: lifecycle 列可留；硬删不可逆须确认
- Explicit errors: 404 文不存在；429 backlog；400 非法 lifecycle

---

## Sync log

| Date | Drift | Action |
| --- | --- | --- |
| 2026-11-25 | 初稿 | active |
| 2026-11-25 | Op1–5 落地；全量 npm test 绿 | synced-ish（生产 cron/真实源待配） |
