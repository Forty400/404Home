# 测试边界 · UX 加载态与时间戳信任

- Status: active
- Related ADR: （无；对齐 `ADR-20261021-hot-articles-home`）
- Related canvas: `docs/spdd/canvases/20261021-ux-loading-trust.md`
- Related 条例: `docs/spdd/4-测试条例/404home-ux-loading-trust-cases.md`
- Updated: 2026-10-21

## 1. System under test

- `listPhase` / `formatRelativeTime` 纯函数
- `seed.ensureHotArticles`（及时间打散）对 `posts.created_at` 的写入
- 视图层消费约定（Home / 详情等）——自动化测函数与 seed；UI 手测

## 2. In scope

- loading 与 empty 互斥判定
- 相对时间文案档位（分钟/小时/天/日期）
- seed 后已发布文章 `created_at` 区分度（避免大批同秒）

## 3. Out of scope（刻意不测）

- 骨架 CSS 像素、动画帧
- 弱网真实 RTT、无障碍完整键盘流
- 源站真实发布时间回填

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| `!list.length` 当空 | 闪空误判 | listPhase 单测 |
| 批量 DEFAULT now | 时间撞车 | seed 分散断言 |
| 无条件 UPDATE 时间 | 踩运营手改 | 仅低区分度时打散 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| `now` | 注入 Date | formatRelativeTime 单测 |
| SQLite | Real 临时 DB | server test helpers |

## 6. Environments

- Local: `npm run test:unit` + `npm run test:server`
- CI: 同上
- Forbidden: 外网请求
