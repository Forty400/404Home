# 测试条例 · 主题色

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`
- Related boundary: `docs/spdd/3-测试边界/404home-theme.md`
- Related canvas: `docs/spdd/canvases/20261008-theme-colors.md`
- Code tests: 待补
- Updated: 2026-10-12

## Cases

### TC-01 · 默认跟随系统

- Priority: P0
- **Given**: 清除 `404home-theme-pref`
- **When**: 刷新首页
- **Then**: `html[data-theme]` 与当前 `prefers-color-scheme` 一致
- **Notes**:

### TC-02 · 显式偏好持久化

- Priority: P0
- **Given**: Header 切换到 light 或 dark
- **When**: 刷新
- **Then**: localStorage 为 `404home-theme-pref`；主题保持所选
- **Notes**: 勿使用废弃键 `404home-theme`

### TC-03 · system 跟随 OS 变化

- Priority: P0
- **Given**: 偏好为 system（或清键）
- **When**: DevTools 切换模拟 OS 亮/暗
- **Then**: `data-theme` 随之更新
- **Notes**:

### TC-04 · admin 与前台同主题

- Priority: P0
- **Given**: 前台已选 dark（或 light）
- **When**: 打开 `/admin`
- **Then**: 同一 `data-theme`，控件可读
- **Notes**:

### TC-05 · 暗色无紫霓虹 / 亮色非纸绿主调

- Priority: P1
- **Given**: 分别切到 light 与 dark
- **When**: 目视首页与 Trial
- **Then**: 暗色无紫 glow；亮色为冷蓝白而非大面积暖纸绿
- **Notes**: 手测

## Traceability

| Case | Boundary section | Spec / ADR |
| --- | --- | --- |
| TC-01–03 | 三态/持久化 | theme §2.1–2.3 |
| TC-04 | 含 admin | theme §1 / §2 |
| TC-05 | 视觉禁区 | theme §2.7–2.8 |
