# 测试边界 · 首页热门文章专区

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261021-hot-articles-home.md`
- Related canvas: `docs/spdd/canvases/20261021-hot-articles-home.md`
- Related 条例: `docs/spdd/4-测试条例/404home-hot-articles-cases.md`
- Updated: 2026-10-21

## 1. System under test

- SQLite `posts` 扩展字段与 `GET /api/posts` 筛选（topic / hot）
- seed/ingest 产出 ≥20 条热门图文（含 cover、source_*、站内 content）
- `Home.vue` 热门文章 Feed + 热门工具条
- `PostDetail` 出处展示
- `AppHeader` 电灯泡主题按钮（亮=light / 灭=dark）

## 2. In scope

- API：`topic`、`hot=1` 过滤；列表仅 `published=1`（非 all）
- 创建/更新校验：`topic` 枚举；有正文时可写出处
- seed：热门文章条数与必填字段（title/summary/content/cover/topic/source_url）
- 首页主栏以文章为主；工具区仍存在
- 灯泡切换 light↔dark 且持久化键不变

## 3. Out of scope（刻意不测）

- 真·网络爬虫、RSS 定时、反爬
- 封面 CDN 可用性 SLA、视觉像素对比
- UGC、评论、点赞
- `/news` `/tutorials` 列表页大改版（可复用详情）

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| 旧 DB 无新列 | 启动崩 | migrate 后 API 可读 |
| 无出处正文 | 合规 | seed/用例要求 source_url |
| 首页只剩文章找不到工具 | IA | 保留热门工具区块 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| SQLite | Real（测试用临时 DB_PATH） | 同现有 server test helpers |
| 外网抓取 | 不用 | seed 本地数据 |

## 6. Environments

- Local: `npm test`（server）+ 手测首页/灯泡
- CI: 随现有 server 测试
- Forbidden in unit/integration: 真实对外 HTTP 抓取
