# 测试条例 · 首页热门文章专区

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261021-hot-articles-home.md`
- Related boundary: `docs/spdd/3-测试边界/404home-hot-articles.md`
- Related canvas: `docs/spdd/canvases/20261021-hot-articles-home.md`
- Code tests: `404home/server/test/hot-articles-p0.test.js`
- Updated: 2026-10-21

## Cases

### TC-01 · 列表按 topic 过滤

- Priority: P0
- **Given**: DB 中存在不同 `topic` 的已发布文章
- **When**: `GET /api/posts?topic=plugin`
- **Then**: 仅返回 `topic=plugin` 且 `published=1` 的项
- **Notes**:

### TC-02 · 热门筛选

- Priority: P0
- **Given**: 若干 `is_hot=1` 与 `is_hot=0` 文章
- **When**: `GET /api/posts?hot=1`
- **Then**: 仅热门项；条数可用于首页
- **Notes**:

### TC-03 · 详情含站内正文与出处

- Priority: P0
- **Given**: 一篇含 `content`、`source_name`、`source_url` 的文章
- **When**: `GET /api/posts/:id`
- **Then**: 字段均返回；`content` 非空；`source_url` 非空
- **Notes**:

### TC-04 · seed/ingest ≥20 条热门图文

- Priority: P0
- **Given**: 空 posts 或执行热门文章 seed 路径
- **When**: 跑 seed/ingest
- **Then**: 至少 20 条带 `cover`、`topic`、`source_url`、非空 `content` 的已发布文
- **Notes**: 可与全量 seed 合并断言

### TC-05 · 非法 topic 拒绝写入

- Priority: P1
- **Given**: admin 已登录
- **When**: `POST /api/posts` 且 `topic` 非法
- **Then**: 400
- **Notes**:

### TC-06 · 灯泡切换主题（手测 / 组件约定）

- Priority: P1
- **Given**: Header 可见灯泡按钮
- **When**: 点击
- **Then**: light↔dark；`404home-theme-pref` 更新；图标亮/灭与 resolved 一致
- **Notes**: 自动化可后续补；首期手测

## Traceability

| Case | Boundary section | ADR |
| --- | --- | --- |
| TC-01–03 | API / 详情 | ADR-20261021 §2–3 |
| TC-04 | seed | ADR-20261021 §4 |
| TC-05 | 校验 | ADR-20261021 §3 |
| TC-06 | 主题 UI | ADR-20261021 §5 |
