# Analysis · 主题色改版（亮蓝白 / 暗深灰）

- Date: 2026-10-08
- Author: agent
- Status: ready
- Related canvas: `docs/spdd/canvases/20261008-theme-color.md`

## 1. Problem

当前 404Home 全站采用「松绿 + 纸感米黄」品牌色（`--accent #1f5b45` / `--accent-soft #dceae2` / `--bg #f3efe6`）。该配色偏小众纸感，与当下主流的「蓝白冷感 + 深灰夜间」流行样式差距较大，且无暗色主题、无主题切换。同时 CSS 变量虽已成型，但前台多处 rgba 替身、`AdminLayout` 侧栏完全硬编码，改主题时极易「改一半漏一半」。

## 2. Goals / Non-goals

**Goals**

- 引入亮色主题：蓝色 + 白色搭配（弃用黄绿）。
- 引入暗色主题：深灰夜间模式（近黑底 + 浅文字）。
- 三态切换：亮 / 暗 / 跟随系统，localStorage 持久化。
- 全站色彩统一走 CSS 变量，消除 rgba 替身与硬编码 `#fff`。
- 后台 `AdminLayout` 侧栏完全跟随主题（不再固定深绿）。

**Non-goals**

- 不做多品牌可配置皮肤、不上 CSS-in-JS / Tailwind。
- 不改信息架构、不改组件结构。
- 不引入 SSR 注入主题（首屏前用内联脚本避免 FOUC 即可）。
- 不动 `--hot` `--new` 信号色（保持产品语义稳定）。

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| 访客 | 首次进入站点 | 默认跟随系统偏好，无白闪 |
| 用户 | 点击顶栏主题开关 | 立即切换并持久化，刷新不变 |
| 管理员 | 后台使用 | 侧栏随主题变化，与前台一致 |

## 4. Constraints

- Tech: Vue 3 + Vue CLI；纯 CSS 变量 + `data-theme` 属性切换；不动后端。
- Time: 单分支 `color` 内完成。
- Ops / security: 无密钥、无网络变更。

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 首屏 FOUC（主题闪烁） | 体验差 | `public/index.html` 注入内联 `<script>`，挂载前读 localStorage 设 `data-theme` |
| 漏改硬编码导致暗色下白底 | 视觉割裂 | 改造清单按文件逐项过；build 后人工抽检 |
| `AdminLayout` 侧栏改浅色后对比度不足 | 可读性差 | 亮色下侧栏用 `--accent` 深蓝作底，保证 WCAG AA |

## 6. Open Questions

- [x] 暗色基调：深灰夜间（`#0f1115` 系）。
- [x] 切换机制：开关 + 持久化 + 跟随系统。
- [x] 后台侧栏：完全跟随主题。

## 7. Recommended Next

生成 REASONS Canvas：`docs/spdd/canvases/20261008-theme-color.md`，然后按 Op 顺序实现。
