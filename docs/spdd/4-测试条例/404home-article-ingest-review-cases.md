# 测试条例 · 采集审稿 / 生命周期 / 回收站

- Status: active
- Related boundary: `docs/spdd/3-测试边界/404home-article-ingest-review.md`
- Related canvas: `docs/spdd/canvases/20261125-article-ingest-review.md`
- Code tests: `404home/server/test/article-ingest-review-p0.test.js`
- Updated: 2026-11-25

## Cases

### TC-01 · 公共列表不含非 published

- Priority: P0
- **Given**: 库中有 draft / pending_review / archived / published 各至少 1
- **When**: `GET /api/posts`
- **Then**: 仅返回 `lifecycle=published`（且 `published=true`）

### TC-02 · 审过仍不上线

- Priority: P0
- **Given**: admin + 一篇 `pending_review`
- **When**: `POST /api/posts/:id/approve`
- **Then**: `lifecycle=draft`；公共列表仍不含该篇

### TC-03 · 发布与下线回收站

- Priority: P0
- **Given**: 一篇 `draft`
- **When**: publish → archive → restore
- **Then**: 依次 `published` / `archived`（公共不可见）/ `draft`

### TC-04 · 另存副本

- Priority: P0
- **Given**: 一篇 `pending_review`
- **When**: `POST /api/posts/:id/fork`
- **Then**: 新行 `draft`；标题含「副本」；原行仍 `pending_review`

### TC-05 · 待审积压闸门

- Priority: P0
- **Given**: 已有 ≥20 篇 `pending_review`（或测试将阈值设为小值）
- **When**: ingest `POST /api/posts` 且 `lifecycle=pending_review`（或 `ingest=1`）
- **Then**: 拒绝；`code=pending_backlog_full`

### TC-06 · 彻底删除

- Priority: P0
- **Given**: 一篇 `archived`
- **When**: `DELETE /api/posts/:id`
- **Then**: 再 GET 404

### TC-07 · 静默采集模块无源站写动词

- Priority: P0
- **Given**: `server/ingest/` 源码
- **When**: 扫描
- **Then**: 不出现对外部目标的 comment/issue/pr/star 写路径（允许本站 `/api/posts`）

### TC-08 · INGEST_TOKEN 可入库

- Priority: P0
- **Given**: `INGEST_TOKEN` 已配置
- **When**: `POST /api/posts` 带 `X-Ingest-Token`、`lifecycle=pending_review`
- **Then**: 200 且入库为待审

### TC-09 · Admin 登录无明文口令

- Priority: P0
- **Given**: `AdminLogin.vue` 源码
- **When**: 扫描
- **Then**: 不含 `admin123` 及「默认账号…admin」类明文提示

### TC-10 · sanitizeHtml 去掉脚本

- Priority: P0
- **Given**: 含 `<script>` / `onclick=` 的 HTML
- **When**: `sanitizeHtml`
- **Then**: 输出不含 script 与 on* 处理器

### TC-11 · ingest control 启停与设置

- Priority: P0
- **Given**: admin
- **When**: `PUT /api/ingest/settings` 改 `enabled=false`、`dailyLimit`
- **Then**: `GET /api/ingest/status` 反映；`enabled=false` 时 `POST /api/ingest/run` 拒绝（或返回 skipped）

## Traceability

| Case | ADR |
| --- | --- |
| TC-01～06 | ADR-20261125 |
| TC-07～08 | 静默采集 / token |
| TC-09～11 | 2026-11-25b 监控与预览 |
