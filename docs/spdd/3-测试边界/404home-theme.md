# 测试边界 · 主题色

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`
- Related canvas: `docs/spdd/canvases/20261008-theme-colors.md`
- Related 条例: `docs/spdd/4-测试条例/404home-theme-cases.md`
- Related 规范: `docs/spdd/1-资产规范/404home-theme.md`
- Updated: 2026-10-12

## 1. System under test

`useTheme.js`、`html[data-theme]`、`AppHeader` 开关、关键页面 CSS 变量生效（含 `/admin`）。

## 2. In scope

- 默认 system；显式 light/dark 持久化键 `404home-theme-pref`
- system 下跟随 OS；刷新保持显式偏好
- 前台与 admin 同主题
- 无紫霓虹/强 glow；亮色非大面积纸绿
- CategoryNav 溢出箭头展开/收起（手测）

## 3. Out of scope（刻意不测）

- 多品牌、自定义取色器、服务端存主题
- 字体改版、全页视觉快照矩阵
- 精确对比度仪器测量（允许抽检）

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| 首屏闪白/闪暗 | UX | 防闪脚本存在 + 手测 |
| 半站未换肤 | 不一致 | 含 Trial/登录/admin |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| localStorage | Real | 可清键测默认 |
| prefers-color-scheme | Real / DevTools 模拟 | |

## 6. Environments

- Local: Chrome DevTools 模拟 OS 主题
- CI: 待定
- Forbidden: —
