# 测试条例 · UX Week B/C

- Status: active
- Related boundary: `docs/spdd/3-测试边界/404home-ux-week-bc.md`
- Related canvas: `docs/spdd/canvases/20261021-ux-week-bc.md`
- Code tests: `404home/src/utils/pickFeaturedRank.spec.js` · `searchHints.spec.js` · `404home/server/test/ux-week-bc-p0.test.js`
- Updated: 2026-11-25

## Cases

### TC-01 · 精选与 Feed 去重

- Priority: P0
- **Given**: posts 含 id 1..5，其中 1,2,3,5 为 hot；Feed 可见 [1,2,3]
- **When**: `pickFeaturedRank(posts, { excludeIds:[1,2,3], limit:5 })`
- **Then**: 不含 1/2/3；含 5；长度 ≤5

### TC-02 · 搜索热词非空

- Priority: P0
- **Given**: `SEARCH_HINTS`
- **When**: 读取
- **Then**: ≥3 个词；含「PPT」

### TC-03 · 热门文章配额

- Priority: P0
- **Given**: seed 后
- **When**: 按 topic 统计 `is_hot=1`
- **Then**: 每个 topic ≤3

### TC-04 · 热门工具配额

- Priority: P0
- **Given**: seed 后
- **When**: 统计 tools `is_hot=1`
- **Then**: ≤8

### TC-05 · 正文无句号灌水

- Priority: P0
- **Given**: seed 后已发布 posts
- **When**: 检查 `content`
- **Then**: 无连续 ≥5 个中文句号 `。`（不做 ≥280 硬凑）

### TC-06 · 工具决策字段

- Priority: P0
- **Given**: seed 后至少 1 个已填字段的工具（如 chatgpt）
- **When**: `GET /api/tools/chatgpt`
- **Then**: `pricing`、`region_avail`、`scenario` 均非空

## Traceability

| Case | UX |
| --- | --- |
| TC-01 | UX-06/09 |
| TC-02 | UX-08 |
| TC-03/04 | UX-06 |
| TC-05 | UX-09 |
| TC-06 | UX-07 |
