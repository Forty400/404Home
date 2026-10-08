---
title: 404Home 主题色（亮/暗/系统）
tags: [404home, frontend, theme, css]
updated: 2026-10-09
---

# 404Home 主题色

## 行为

- 偏好三态：`system` | `light` | `dark`，**默认 `system`**（跟随 `prefers-color-scheme`）。
- 解析结果写在 `html[data-theme="light|dark"]`；`system` 时监听 OS 变化并更新。
- Header 提供亮/暗 **开关**（`role="switch"`）：按当前解析结果在 light↔dark 间切换；默认仍可为 `system`，首次拨动后写入显式偏好。
- 持久化：`localStorage['404home-theme-pref']`（勿用已废弃的 `404home-theme`）。
- 全站共用（含 `/admin`），无后端主题 API。
- 分类顶栏（`CategoryNav`）：单行裁切、无横向滚动；溢出时右侧箭头展开为多行，再点收起。

## 视觉

- **亮色**：DeepSeek 邻域蓝白；accent ≈ `#4D6BFE`，冷灰白画布。
- **暗色**：通用 slate；accent ≈ `#6B85FF`；禁止紫霓虹 / 强 glow。
- Token 定义在 `404home/src/assets/main.css`（`--bg`、`--accent`、`--bg-page` 等）。
- 组件颜色只用 `var(--*)` / `color-mix`，不写死纸感绿或纯白底。

## 代码锚点

| Path | Role |
| --- | --- |
| `404home/src/composables/useTheme.js` | `initTheme` / `setTheme` / `cycleTheme` |
| `404home/public/index.html` | 防闪：首屏按偏好解析 `data-theme` |
| `404home/src/main.js` | 启动时 `initTheme()` |
| `404home/src/components/AppHeader.vue` | 切换控件 |

## SPDD

- 分析：`docs/spdd/analysis/20261008-theme-colors.md`
- 画布：`docs/spdd/canvases/20261008-theme-colors.md`（synced）
