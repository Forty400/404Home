---
title: 404Home 主题色与切换机制
tags: [404home, frontend, theme, css]
updated: 2026-10-08
---

# 404Home 主题色与切换机制

## 双主题色板

| 变量 | 亮色（蓝白） | 暗色（深灰夜间） |
| --- | --- | --- |
| `--bg` | `#f5f7fb` | `#0f1115` |
| `--bg-elevated` | `#ffffff` | `#161b22` |
| `--ink` | `#0f172a` | `#e6edf3` |
| `--ink-soft` | `#475569` | `#9aa7b8` |
| `--line` | `#e2e8f0` | `#232a33` |
| `--accent`（蓝） | `#2563eb` | `#3b82f6` |
| `--accent-soft` | `#dbeafe` | `#1e2a44` |
| `--accent-strong` | `#1d4ed8` | `#1d4ed8` |
| `--accent-ink`（反色文字） | `#ffffff` | `#ffffff` |
| `--bg-grad-start/end` | `#eef2ff` / `#e2e8f0` | `#0b0d10` / `#161b22` |

派生 rgba 变量：`--ink-a5/a10/a35`、`--accent-a6/a25`、`--bg-a70/a80/a90/a95`、`--bg-elevated-a70/a80/a90/a95`、`--accent-ink-a12/a20/a80`、`--hot-a12`、`--new-a12`。所有 scoped style 内禁写裸 hex/rgba，必须走变量。

## 切换机制

- 三态：`light | dark | auto`，定义在 `404home/src/utils/theme.js`。
- 锚点：`<html data-theme="light|dark|auto">`。
- 持久化：`localStorage['404home:theme']`，默认 `auto`。
- 防 FOUC：`404home/public/index.html` `<head>` 内联同步脚本，Vue 挂载前设 `data-theme`。
- CSS 解析（`404home/src/assets/main.css`）：
  - `:root` = 亮色基线。
  - `[data-theme="dark"]` = 暗色。
  - `@media (prefers-color-scheme: dark)` 内 `:root:not([data-theme])` 与 `[data-theme="auto"]` = 暗色（即 auto 跟随系统；显式 light/dark 不受影响）。
- UI：`404home/src/components/ThemeToggle.vue`，挂载于 AppHeader `.header-actions`，点击循环 `light→dark→auto→light`，监听系统变化刷新图标。
- `404home/src/main.js` 调 `initTheme()` 做保险初始化。

## 后台侧栏

`AdminLayout` 侧栏完全跟随主题：背景 `var(--accent-strong)`、文字 `var(--accent-ink)`、激活态 `var(--accent-ink-a12)`、退出按钮边框 `var(--accent-ink-a20)`。亮色下深蓝侧栏，暗色下随主题深蓝。

## 信号色

`--hot` `--new` 保留产品语义；暗色下提亮（`--hot #e0714f`、`--new #5aa9d6`），其底色走 `--hot-a12` / `--new-a12`。

## 改造范围（已落地）

- main.css 重写为变量体系（亮/暗/auto）。
- 全站硬编码 rgba 替身与 `#fff` 清零：AppHeader、AdminLayout、CategoryNav、AppFooter、SearchBar、ToolCard、ToolDetail、Trial、admin/{Categories,Posts,Tools,Chats}、user/{Login,Register}、PasswordInput。
- 新增 `theme.js` + `ThemeToggle.vue`。
- `index.html` 防 FOUC 内联脚本。
- 弃用旧松绿/米黄：`#1f5b45` `#dceae2` `#f3efe6` `#fffdf8` `#d8d0c2` `#16352a` `#eef7f1` `#f7fff9` `#f4fff8` `#f7f3eb` `#ebe4d7` 均不再出现于源码。
