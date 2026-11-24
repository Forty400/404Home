# 测试边界 · 采集审稿 / 生命周期 / 回收站

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261125-article-ingest-review.md`
- Related canvas: `docs/spdd/canvases/20261125-article-ingest-review.md`
- Related 条例: `docs/spdd/4-测试条例/404home-article-ingest-review-cases.md`
- Updated: 2026-11-25

## 1. System under test

- `posts.lifecycle` 迁移与同步 `published`
- `server/routes/posts.js` 生命周期动作与公共过滤
- 待审积压闸门（默认 20）
- 采集拼装/静默约束（脚本层断言或源码约束）
- Admin 待审 / 写稿 / 回收站路由存在（源码断言辅证）

## 2. In scope

- 公共列表/详情仅 `published`
- approve → draft；publish → published；archive → archived；restore → draft；fork 副本；DELETE
- ingest 创建 `pending_review`；积压 ≥20 拒绝
- `source_url` 去重（同 URL 再 ingest 不重复插入）

## 3. Out of scope

- 真实外网爬取成功率、源站改版、富文本所见即所得像素、LLM 润色

## 4. Risk hotspots

| Area | Why | Coverage |
| --- | --- | --- |
| 前台漏出 archived/pending | 信任边界 | GET 过滤用例 |
| 积压闸门失效 | 压满待审 | ≥20 拒绝 |
| 静默破坏 | 扰民 | 采集模块无源站写方法 |

## 5. Environments

- `npm test`（`404home`）
