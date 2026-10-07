# REASONS Canvas · 详情页同分类相关工具

- Date: 2026-10-06
- Status: synced
- Related analysis: `docs/spdd/analysis/20261006-related-tools.md`
- Code anchors: `404home/src/views/ToolDetail.vue`

---

## R · Requirements

### Business goal

详情页停留时继续发现同场景工具，缩短回列表再点的路径。

### In scope

- 详情成功加载后，按 `category_slug` 拉同分类工具
- 排除当前 slug，最多 6 条，用 `ToolCard` 展示
- 区块标题含「查看更多」到分类页
- 无线相关时不渲染该区块

### Out of scope

- 新 API、标签匹配、广告位

### Acceptance criteria

- [x] `/tool/chatgpt` 出现同分类其他工具卡片
- [x] 列表不含当前工具
- [x] 点卡片进入对应 `/tool/:slug`
- [x] 错误详情页不请求相关列表

---

## E · Entities

| Entity | Use |
| --- | --- |
| Tool | 当前详情 + 同分类 siblings |

---

## A · Approach

复用 `api.getTools({ category, pageSize: 8 })`，前端过滤当前 slug 后 slice(0, 6)。

| Option | Decision |
| --- | --- |
| 后端 related 接口 | 否，本轮不需要 |
| 标签交集 | 否，复杂度高 |

---

## S · Structure

| Path | Change |
| --- | --- |
| `404home/src/views/ToolDetail.vue` | 相关区块 + 拉数 |

Order: 详情成功后再请求 related。

---

## O · Operations

### Op 1 · 详情页加载 related 并展示

- **Files**: `404home/src/views/ToolDetail.vue`
- **Do**: 引入 ToolCard；详情成功且有 `category_slug` 时 `getTools`；过滤当前 slug；最多 6；区块在 article 下方；「查看更多」链分类
- **Done when**: 有 siblings 才显示 grid；slug 变化时刷新

---

## N · Norms

- 复用 `tool-grid`、纸感样式
- 外链仍走 ToolCard「访问」
- 不新增依赖

---

## S · Safeguards

- 不写死工具列表
- 不改 schema / SSH 密码
- related 失败时静默为空，不影响主详情

---

## Sync log

| Date | Drift | Action |
| --- | --- | --- |
| 2026-10-06 | 无 | 仅改 ToolDetail：同分类 getTools 过滤当前 slug，最多 6 条 |
