# 测试边界 · UX Week B/C

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261021-ux-week-bc.md`
- Related canvas: `docs/spdd/canvases/20261021-ux-week-bc.md`
- Related 条例: `docs/spdd/4-测试条例/404home-ux-week-bc-cases.md`
- Updated: 2026-10-21

## 1. System under test

- `pickFeaturedRank` / `SEARCH_HINTS`
- seed：热门配额、正文补厚、工具决策字段回填
- `tools` schema 新列经 migrate + API 读写

## 2. In scope

- 精选榜与 Feed id 去重
- 每 topic 热门文章 ≤3；热门工具 ≤8
- 文章 `content` 长度下限（seed 后）
- 工具 `pricing` / `region_avail` / `scenario` 可读写
- 搜索热词常量非空

## 3. Out of scope

- 视觉像素、真实弱网、未登录模型调用、文章搜索

## 4. Risk hotspots

| Area | Why | Coverage |
| --- | --- | --- |
| 热门裁剪误伤 | 运营置顶被清 | 仅超配额裁剪 |
| Trial 预览打 API | 成本/违规 | 不测 UI 调 API；规范禁止 |

## 5. Dependencies & doubles

| Dep | Mode |
| --- | --- |
| SQLite | Real 临时 DB |

## 6. Environments

- `npm test`
