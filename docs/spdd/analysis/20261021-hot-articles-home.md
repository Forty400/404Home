# Analysis · 首页热门文章专区（图文 Feed）

- Date: 2026-10-21
- Author: SPDD cycle（用户需求录入）
- Status: ready
- Related canvas: `docs/spdd/canvases/20261021-hot-articles-home.md`
- Related ADR: `docs/spdd/2-adr决策/ADR-20261021-hot-articles-home.md`

## Decisions log（已拍板 · 独立开发者产品视角）

| ID | Date | Decision |
| --- | --- | --- |
| D1 | 2026-10-21 | **首页 B**：文章 Feed 为主 + 下方热门工具条；不新建 `/tools` 迁移。 |
| D2 | 2026-10-21 | **正文站内** + 必注 `source_name` / `source_url`；内容为整理稿非镜像爬取。 |
| D3 | 2026-10-21 | **中台 A**：seed/ingest ≥20 条；不做定时爬虫/独立中台。 |
| D4 | 2026-10-21 | **模型**：加 `topic`（plugin\|dev\|method\|news），保留 `type` 兼容。 |
| D5 | 2026-10-21 | **灯泡**：亮灯=亮色，灭灯=暗色；色板与 `404home-theme-pref` 不变。 |
| D6 | 2026-10-21 | 局部放宽作品集冻结：允许宿主首页 IA，Trial 仍为作品集主角。 |

## 1. Problem

当前 `/`（`Home.vue`）是「热门工具 + 最新收录 + 分类网格」，资讯仅在 `SidePanel` 侧栏摘 5 条；`posts` 只有 `news|tutorial`，无面向 AI 插件/方法论的图文专区，也无批量内容生产管线。

用户期望：打开站点即进入 **热门文章专区**，内容以 AI 生态资讯/方法论为主，有图文、有中文热门站常见信息架构，并能持续从网络信息产出入库。

不做则：首页仍像工具目录，内容运营能力停在手动 CMS 几条样例；与「AI 信息入口」定位错位。

## 2. Goals / Non-goals

**Goals**

- `/` 首屏以 **热门文章图文列表** 为主（约 20 条可见或分页首屏），布局参考中文互联网热门形态（主栏卡片/左图右文 + 右侧榜单/分类 tab），**颜色仍走现有 CSS 变量**。
- 文章主题覆盖四类：`plugin`（插件）/ `dev`（开发）/ `method`（方法论）/ `news`（新闻）；详情页可继续用 `PostDetail` 或轻量扩展。
- 内容进 SQLite：扩展 `posts`（或兼容字段：`category`/`tags`、`source_url`、`is_hot`、封面），API 列表支持筛选与热门排序。
- **中台产出**：服务端脚本/管理路径负责抓取或整理网络公开信息 → 规范化 → 写入 DB；前端只渲染框架与数据绑定。
- Seed/作业产出 **≥20 条** 带封面、标题、摘要、正文（或可点开的正文）的样例数据，本地一键可复现。
- Header 主题切换：**电灯泡按钮**（亮=亮色/暗=暗色或点亮/熄灭语义清晰），去掉「亮色/暗色」滑块文案；`useTheme` / `localStorage` 行为不变。

**Non-goals**

- 不改变现有亮/暗色板与 token 命名（非本次换肤）。
- 不新建独立中台微服务 / 消息队列；不做全网违法爬虫或绕过站点反爬。
- 不做用户 UGC 发帖、评论、点赞社交闭环（首期）。
- 不把 Trial（`/trial`）从作品集主角叙事里移除；工具导航路由保留。
- 不引入新 UI 库仅为 Feed。

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| 访客 | 打开 `/` | 看到图文热门文章专区，而非大块工具网格为主 |
| 访客 | 按分类/标签浏览 AI 插件或方法论 | 列表过滤正确，点进详情有正文与图 |
| 访客 | 点 Header 灯泡 | 亮↔暗切换，无闪白，偏好记住 |
| 运营/管理员 | 在 `/admin` 或脚本更新文章 | 可增删改；抓取产出可入库 |
| 开发者 | `seed` / ingest 本地跑一遍 | DB 中稳定出现约 20 条带 cover 的文章 |

## 4. Constraints

- Tech: Vue 3 + Koa + SQLite；已有 `posts.cover`、`News.vue`/`Tutorials.vue`/`PostDetail.vue`、`admin/Posts.vue` 可扩展。
- Product: `ADR-20261015-portfolio-freeze` —— 作品集对外主角仍是 Trial；本需求改 **宿主首页信息架构**，需在画布/ADR 中写明「导航宿主首页 = 热门文章，Trial 入口仍在 Header」。
- Ops / security: 抓取须遵守来源 ToS；外链封面注意热链失效与 CSP；`source_url` 保留出处；禁止把密钥写进前端。
- Time: 适合「前端壳 + schema/API + seed20 + 灯泡」一迭代；定时自动爬可二期。
- A11y: 灯泡按钮保留 `aria-label` / `title`；封面 `alt` 用标题。

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 首页从工具站变为资讯站，旧用户找不到工具 | 导航困惑 | Header「工具集」链到工具聚合页或首页次级区块；画布定 IA |
| 版权/抓取合规 | 法务与运维风险 | 首期用公开摘要 + 原文链接，或人工整理 seed；不存整站镜像 |
| `posts.type` 仅 news\|tutorial | schema 迁移摩擦 | 扩展 CHECK 或加 `topic` 字段；兼容旧数据 |
| 封面外链失效 | 列表破图 | 占位图 + 可选本地 `/uploads`；ingest 写绝对 URL |
| 与作品集叙事冲突 | 评审扯皮 | ADR 一页说明首页 vs Trial 关系 |

## 6. Open Questions

- [x] Q1 → **B**（D1）
- [x] Q2 → **A** seed（D3）
- [x] Q3 → **站内全文 + 出处**（D2）
- [x] Q4 → **topic 字段**（D4）
- [x] Q5 → **亮灯=亮色 / 灭灯=暗色**（D5）

## 7. Recommended Next

→ 画布已建：`docs/spdd/canvases/20261021-hot-articles-home.md` → `spdd-generate`
