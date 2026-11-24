# Analysis · 文章采集机器人 + 审稿 / 上下线 / 回收站

- Date: 2026-11-25
- Author: user + AI（brainstorming 对齐）
- Status: accepted
- Related canvas: `docs/spdd/canvases/20261125-article-ingest-review.md`

## 1. Problem

404Home 首页与资讯依赖人工 seed/后台录入，素材供给慢。需要服务器侧定时采集 AI 资讯与 GitHub 方法论类公开内容，整理成站内稿进**待审**，由编辑审核、手动发布；并具备上下线与回收站彻底删除，便于清理过期文。

不做则：内容老化、运营仍靠手工粘贴；过期文只能硬删或继续占首页。

## 2. Goals / Non-goals

**Goals**

- 多采集器（至少：资讯平台、GitHub 方法论/README）定时跑；**共用待审箱**，带来源标签；约 **5 篇/天** 进草稿。
- **待审积压闸门**：`pending_review` ≥ **20** 时，所有采集器**本轮不入库、不更新稿件**（跳过并打日志），避免压满待审箱。
- 规则拼装整理稿（可原文迁移）；**不调 LLM**；编辑后续可手动 AI 润色。
- **静默采集**：只读拉取公开内容写进本站待审；**禁止**在源站/GitHub 发评论、Issue、PR、Star 刷量、私信或任何对外互动，避免引他站用户反感。
- 保留核心信息并**注明出处**（`source_name` / `source_url`）。
- Admin：**待审页**（通过 / 退回 / 删；**另存副本**为临时草稿再编）；**手写富文本发布页**。
- 审过 ≠ 上线；**手动发布**。
- **上线 / 下线**：下线进**回收站归档**（前台与日常列表不可见）；可恢复；可**彻底删除**清库。

**Non-goals**

- 本期不做模型自动润色 / 摘要生成。
- 不做全网任意站无限制爬虫、绕过登录墙、批量镜像整站。
- 不做 C 端用户投稿、多编辑协作、支付相关。
- 不做向量检索文章（工具 RAG 仍只管 tools）。

**Anti-goals（做成了也算失败）**

- 未审自动上首页；漏挂出处；前台仍露出已下线/回收站稿。
- 采集器在源平台留言、互动或制造噪音（非静默）。

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| 采集机器人 | 每日按源抓取并拼装 | 约 5 篇 `pending_review` 入库，带来源标签与出处；积压 ≥20 则跳过 |
| 编辑（admin） | 待审箱审稿 | 通过后仍为未发布草稿；可退回/删；可另存副本编辑 |
| 编辑 | 手写发文 | 富文本写稿、保存草稿或直接发布 |
| 编辑 | 清理过期 | 下线→回收站；可恢复或彻底删除 |
| 访客 | 读首页/列表/详情 | 只见已发布且未归档文 |

## 4. Constraints

- Tech: 沿用 404Home（Vue3 + Koa + SQLite）；采集进程可独立 Node 脚本 / pm2 cron，经 admin API 或直写 DB（优先 API + 服务端密钥）。
- Content: 整理稿/原文迁移须可审；版权风险用「注明出处 + 人工发布」兜底，不追求逐字整站搬运规模。
- Conduct: 采集**只读、静默**；无写权限 token（若用 GitHub API 仅 public read）；不配置自动评论/互动能力。
- Ops: 部署在现有腾讯云机 `/var/www/404home`；密钥与源配置不进公开仓（`deploy.local` / server `.env`）。
- Time: 先落状态机 + admin 审稿/写稿/回收站，再接 1～2 个采集器。

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 源站改版 / 限流 | 采集失败 | 源适配隔离；失败打日志；不阻塞 API |
| 版权投诉 | 合规 | 强制出处；默认不自动发布；可下线+硬删 |
| 对外互动惹反感 | 口碑/封号 | 静默只读；禁止评论/Issue/PR 等写操作 |
| 状态混乱（草稿/待审/已发/回收站） | 前台漏出 | 单一 `lifecycle`（或等价字段）；列表默认过滤 |
| 多机器人重复稿 | 待审噪音 | URL / 标题去重 |
| 待审积压压满 | 审不过来、库膨胀 | `pending_review` ≥20 停采；清到不足 20 后再跑 |
| 富文本 XSS | 安全 | 入库消毒或安全渲染；仅 admin 写 |

## 6. Design decisions（已拍板）

### 6.1 文稿生命周期（建议字段）

在 `posts` 上扩展（名称实现时可微调，语义固定）：

| 状态 | 含义 | 前台可见 | 日常 admin 列表 |
| --- | --- | --- | --- |
| `pending_review` | 机器人提交待审 | 否 | 待审页 |
| `draft` | 手写草稿 / 审过未发 / 副本 | 否 | 草稿 |
| `published` | 已上线 | 是 | 已发布 |
| `archived` | 回收站 | 否 | 仅回收站 |

动作：

- 机器人入库 → `pending_review` + `published=0`（或取消单独 published，以 lifecycle 为准；**实现择一，全链路一致**）。
- 审稿「通过」→ `draft`（仍不上线）。
- 「发布」→ `published`。
- 「下线」→ `archived`。
- 「从回收站恢复」→ `draft` 或 `published`（默认 `draft`，避免误上线——**builder 默认**）。
- 「彻底删除」→ DELETE 行。
- 「另存副本」→ 新行 `draft`，拷贝正文/出处，标题可加「（副本）」；原待审稿保留直至处理。

### 6.2 Admin IA

- `/admin/posts/review`（或等价）：待审队列；操作：通过、退回（可回 `draft` 或删）、删、另存副本。
- `/admin/posts/editor`：手写富文本；保存草稿 / 发布；编辑已有草稿。
- `/admin/posts/trash`：回收站；恢复、彻底删除。
- 现有 `/admin/posts` 可收敛为总览或改造成上述入口（**builder 默认：导航拆三入口，旧弹窗表单逐步退役到 editor**）。

### 6.3 采集器

- 独立可调度单元（pm2 cron / systemd timer）；配置源列表。
- **NewsBot**：RSS/公开列表 → 正文抽取或摘要拼装模板 → POST 待审。
- **GitHubBot**：搜索/公开 README → 节选 + 仓库元数据拼装 → POST 待审（**不** watch/star/fork/comment）。
- 配额：全局或分 bot 合计约 5/天；去重 `source_url`。
- **积压闸门（硬约束）**：开跑前（及每写入前）统计 `lifecycle = pending_review`；若 **≥ 20**，本轮所有 bot **不新增、不更新**任何稿件，仅日志如 `skip ingest: pending_review=N≥20`。阈值可配置，默认 20。
- **静默约束（硬）**：采集代码路径不得包含对源站的 POST/PUT/PATCH/DELETE（本站 ingest API 除外）；GitHub 若需 token 仅 `public_repo` 只读类，禁止写 scope。
- 拼装模板固定段落结构（导语 / 要点 / 出处），无 LLM。

### 6.4 API（方向）

- 公共 `GET /api/posts`：仅 `published`（且非 archived）。
- Admin：`all` / `lifecycle=` 筛选；`POST` 创建；`PUT` 更新；`POST :id/approve`、`publish`、`archive`、`restore`；`DELETE` 硬删；`POST :id/fork` 另存副本。
- 采集入库 API：若待审已 ≥20，返回可识别错误（如 `429` / `403` + `pending_backlog_full`），bot 侧视为跳过而非重试轰炸。
- 采集器用服务端 token 或现有 admin JWT（**builder 默认：复用 admin 鉴权 + 可选 `INGEST_TOKEN`**）。

## 7. Open Questions

- [x] 待审共用箱 vs 分箱 → 共用 + 来源标签
- [x] 通过是否直接上线 → 否，手动发布
- [x] 下线语义 → 回收站；可硬删
- [x] 是否调模型 → 否，规则拼装 / 原文迁移
- [ ] 第一版具体源 URL 列表（实现前由编辑提供 1～2 个资讯源 + 1 组 GitHub query；未提供则用可配置占位 + 手动触发 dry-run）— **不阻塞画布**
- [ ] 富文本组件选型（如现成轻量 editor）— **builder 默认：选已有生态、少依赖**

## 8. Recommended Next

1. 落 ADR（生命周期 + 采集不调模型 + 不自动发布）。
2. 更新 `3-测试边界` / `4-测试条例`。
3. 生成 REASONS Canvas：`docs/spdd/canvases/20261125-article-ingest-review.md`。
4. 按画布 TDD 实现：DB/API → admin 三页 → 采集脚本骨架 → 部署 cron。

→ 生成 REASONS Canvas：`docs/spdd/canvases/20261125-article-ingest-review.md`
