# 测试条例 · 工具详情页

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`
- Related boundary: `docs/spdd/3-测试边界/404home-tool-detail.md`
- Related canvas: `docs/spdd/canvases/20261002-tool-detail.md`
- Code tests: 待补
- Updated: 2026-10-12

## Cases

### TC-01 · 合法 slug 展示详情

- Priority: P0
- **Given**: DB 中存在工具（如 seed 的 chatgpt）
- **When**: 打开 `/tool/<slug>`
- **Then**: 展示 name、summary、tags、分类、热门/新标记（若有）、访问官网按钮
- **Notes**:

### TC-02 · 卡片主体进详情，「访问」外链

- Priority: P0
- **Given**: 首页或列表有 ToolCard
- **When**: 点击卡片主体；再点「访问」
- **Then**: 主体进入 `/tool/:slug`；「访问」`target=_blank` 且不触发详情导航
- **Notes**:

### TC-03 · 非法 slug 空态

- Priority: P0
- **Given**: 不存在的 slug
- **When**: 打开 `/tool/not-exist-xxx`
- **Then**: 空态可见，可回首页；非白屏
- **Notes**:

### TC-04 · 外链安全属性

- Priority: P1
- **Given**: 详情页官网按钮
- **When**: 检查 DOM
- **Then**: `rel` 含 `noopener`（及 noreferrer 若规范要求）
- **Notes**:

## Traceability

| Case | Boundary section | Spec / ADR |
| --- | --- | --- |
| TC-01 | In scope 字段 | tool-detail §2.3 |
| TC-02 | ToolCard | tool-detail §2.4 |
| TC-03 | 空态 | tool-detail §2.5 |
| TC-04 | noopener | tool-detail §2.4 |
