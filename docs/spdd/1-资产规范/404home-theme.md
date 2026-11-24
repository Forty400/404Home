# 规范 · 主题色（亮 / 暗 / 系统）

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-specs-by-module.md`
- Related canvas: `docs/spdd/canvases/20261008-theme-colors.md`
- Related tests: `3-测试边界/404home-theme.md` · `4-测试条例/404home-theme-cases.md`
- Updated: 2026-10-12
- Source confidence: high（synced；覆盖历史「纸感浅绿」约定）

## 1. Scope

全站（含 `/admin`）主题偏好、解析、`data-theme` 与 CSS token。不含多品牌换肤、自定义取色器、服务端存主题。

## 2. Rules

1. 偏好三态：`system` | `light` | `dark`，**默认 `system`**（`prefers-color-scheme`）；`system` 时监听 OS 变化。
2. 解析结果写在 `html[data-theme="light|dark"]`。
3. 持久化键：**`localStorage['404home-theme-pref']`**（废弃 `404home-theme`）。
4. 逻辑集中在 `useTheme.js`（`initTheme` / `setTheme` / `cycleTheme`）；组件**禁止**直接读写 localStorage。
5. Header：亮/暗开关（`role="switch"`），按当前解析结果在 light↔dark 切换；首次拨动后写入显式偏好。
6. 组件颜色只用 `var(--*)` / `color-mix`，token 在 `404home/src/assets/main.css`。
7. **亮色**：DeepSeek 邻域蓝白，accent ≈ `#4D6BFE`，冷灰白画布；禁止大面积暖奶油纸绿。
8. **暗色**：通用 slate，accent ≈ `#6B85FF`；**禁止**紫霓虹 / 强 glow。
9. 首屏防闪：`public/index.html` 内联解析；`main.js` 启动 `initTheme()`。
10. `CategoryNav`：单行裁切、无横向滚动；溢出右侧箭头展开多行，再点收起。
11. 无主题 UI 库；Trial 等页面共用全局 token，不单开主题文件。
12. 可访问性：开关可键盘聚焦；主按钮对比度抽检 ≥ 4.5:1。

## 3. Examples

**Good**

- 按钮背景 `var(--accent)`；刷新后显式偏好仍生效；`/admin` 与前台同主题。

**Bad**

- 组件写死 `#fff` / 纸绿；暗色用紫渐变 glow；只改首页不改 Trial/表单。

## 4. Enforcement

- Code anchors：`useTheme.js`、`main.css`、`AppHeader.vue`、`index.html`、`main.js`
- Rule：`.cursor/rules/404home-conventions.mdc`
- RAG：`docs/spdd/rag/knowledge/404home-theme.md`
