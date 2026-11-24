# 测试条例 · UX 加载态与时间戳信任

- Status: active
- Related boundary: `docs/spdd/3-测试边界/404home-ux-loading-trust.md`
- Related canvas: `docs/spdd/canvases/20261021-ux-loading-trust.md`
- Code tests: `404home/src/utils/listPhase.spec.js` · `formatRelativeTime.spec.js` · `404home/server/test/ux-loading-trust-p0.test.js`
- Updated: 2026-10-21

## Cases

### TC-01 · loading 时不为 empty

- Priority: P0
- **Given**: `loading=true` 且 `length=0`
- **When**: `listPhase(loading, length)`
- **Then**: 返回 `loading`（不得为 `empty`）

### TC-02 · 完成后才 empty

- Priority: P0
- **Given**: `loading=false` 且 `length=0`
- **When**: `listPhase`
- **Then**: 返回 `empty`

### TC-03 · 有数据为 ready

- Priority: P0
- **Given**: `loading=false` 且 `length>0`
- **When**: `listPhase`
- **Then**: 返回 `ready`

### TC-04 · 相对时间档位

- Priority: P0
- **Given**: 固定 `now`
- **When**: 输入距今 30s / 5min / 3h / 2d / 10d 的时间串
- **Then**: 分别为「刚刚」「5 分钟前」「3 小时前」「2 天前」「YYYY-MM-DD」

### TC-05 · seed 时间戳不过度撞车

- Priority: P0
- **Given**: 执行含热门文章的 seed（临时 DB）
- **When**: 统计已发布 posts 的 `created_at`
- **Then**: `COUNT(DISTINCT created_at) >= min(10, COUNT(*))`（或等价：同秒占比不过半且至少 8 个不同值）

## Traceability

| Case | Boundary | Canvas |
| --- | --- | --- |
| TC-01–03 | listPhase | UX-01 |
| TC-04 | RelativeClock | UX-03 UI |
| TC-05 | seed | UX-03 data |
