# 测试边界 · UX Sprint A（闭环）

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261021-ux-sprint-a-loops.md`
- Related canvas: `docs/spdd/canvases/20261021-ux-sprint-a-loops.md`
- Related 条例: `docs/spdd/4-测试条例/404home-ux-sprint-a-loops-cases.md`
- Updated: 2026-11-25

## 1. System under test

- `matchPostsByQuery`
- seed：`thickenShortArticles` / 重复 pad 折叠 / 句号尾巴清理
- （文案与 AuthModal 布局以手测 + 源码断言辅证，不强制视觉像素）

## 2. In scope

- 关键词匹配 title/summary（大小写不敏感）
- 已发布文章 content 不出现连续两段相同 BODY_PAD
- 不出现连续 ≥5 个中文句号灌水；seed 不做句号补齐

## 3. Out of scope

- 全文搜索相关性排序、支付、AuthModal 像素截图 CI

## 4. Risk hotspots

| Area | Why | Coverage |
| --- | --- | --- |
| thicken 再灌水 | 重复 pad | 折叠 + 至多一次 |
| 空搜无引导 | 跳出 | matchPosts + Search 接线 |

## 5. Environments

- `npm test`（根 `404home`）
