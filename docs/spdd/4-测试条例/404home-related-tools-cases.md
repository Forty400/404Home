# 测试条例 · 详情页相关工具推荐

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`
- Related boundary: `docs/spdd/3-测试边界/404home-related-tools.md`
- Related canvas: `docs/spdd/canvases/20261006-related-tools.md`
- Code tests: 待补
- Updated: 2026-10-12

## Cases

### TC-01 · 同分类推荐且排除自身

- Priority: P0
- **Given**: 某分类下 ≥2 个工具
- **When**: 打开其中一工具详情
- **Then**: 推荐区出现其他同分类卡片，不含当前 slug；条数 ≤6
- **Notes**:

### TC-02 · 推荐卡片进入详情

- Priority: P0
- **Given**: 推荐区有卡片
- **When**: 点击卡片主体
- **Then**: 路由到对应 `/tool/:slug`
- **Notes**:

### TC-03 · 详情错误不请求推荐

- Priority: P0
- **Given**: 非法 slug 详情页
- **When**: 观察网络请求
- **Then**: 无 `GET /api/tools?category=...` 相关推荐请求
- **Notes**:

### TC-04 · 无 siblings 不渲染区块

- Priority: P1
- **Given**: 分类下仅当前工具
- **When**: 打开详情
- **Then**: 不渲染推荐区块
- **Notes**:

### TC-05 · 推荐失败不影响主详情

- Priority: P0
- **Given**: 详情成功但 list API 失败（Stub）
- **When**: 加载完成
- **Then**: 主详情仍正常；推荐为空或不显示，无整页错误
- **Notes**:

## Traceability

| Case | Boundary section | Spec / ADR |
| --- | --- | --- |
| TC-01–02 | In scope | related-tools §2.2–2.5 |
| TC-03 | 错误不请求 | related-tools §2.1 |
| TC-04 | 无 siblings | related-tools §2.4 |
| TC-05 | 失败静默 | related-tools §2.6 |
