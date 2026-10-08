# REASONS Canvas · 主题色改版（亮蓝白 / 暗深灰）

- Date: 2026-10-08
- Status: active
- Related analysis: `docs/spdd/analysis/20261008-theme-color.md`
- Code anchors: `404home/src/assets/main.css`、`404home/src/main.js`、`404home/public/index.html`、`404home/src/components/`、`404home/src/layouts/AdminLayout.vue`、`404home/src/views/**`

---

## R · Requirements（为什么、范围）

### Business goal

把 404Home 配色从「松绿 + 纸感米黄」迁移到当下流行的「亮蓝白 + 暗深灰」双主题，提供三态切换（亮 / 暗 / 跟随系统），全站色彩统一走 CSS 变量，后台侧栏完全跟随主题。**弃用黄绿搭配。**

### In scope

- 亮色主题：蓝（`--accent`）+ 白（`--bg` / `--bg-elevated`）主搭配。
- 暗色主题：深灰夜间（近黑底 + 浅文字 + 蓝强调）。
- 三态切换组件 `ThemeToggle.vue` + `theme.js` 工具：localStorage 持久化、`prefers-color-scheme` 跟随。
- `main.css` 变量体系扩展：补齐 rgba 替身、统一反色文本、body 渐变提升为变量。
- `AdminLayout` 侧栏纳入变量体系，跟随主题。
- 全站组件硬编码颜色清理：AppHeader / CategoryNav / AppFooter / SearchBar / ToolCard / ToolDetail / Trial / admin 表视图 / user Login / Register / PasswordInput。
- `public/index.html` 注入内联脚本防 FOUC。

### Out of scope

- 多皮肤/品牌主题市场。
- Tailwind / CSS-in-JS 接入。
- 改信息架构、组件结构、路由。
- 改 `--hot` `--new` 信号色语义。
- SSR 主题注入（首屏内联脚本足够）。
- 微信/邮箱/钱包相关业务逻辑。

### Acceptance criteria

- [ ] 亮色主题下全站无任何黄绿色残留（`#1f5b45` `#dceae2` `#f3efe6` `#fffdf8` `#d8d0c2` 等松绿/米黄值不再出现于源码）。
- [ ] 暗色主题下背景近黑、文字浅、强调为蓝，无白底割裂。
- [ ] `ThemeToggle` 三态可循环切换（light → dark → auto → light）；localStorage 记录 `theme` 值；刷新保留。
- [ ] `auto` 态跟随系统 `prefers-color-scheme` 实时变化（系统切换无需刷新）。
- [ ] 首次加载无主题闪烁（FOUC）：`<html data-theme>` 在 Vue 挂载前已就位。
- [ ] `AdminLayout` 侧栏亮色下为浅色底+深蓝链接，暗色下为深底+浅文字，与前台主题一致。
- [ ] 所有原本硬编码 `rgba(...)` 替身与 `#fff` 替换为对应 CSS 变量。
- [ ] `npm run build` 通过，无新增 ESLint 报错。
- [ ] 移动端窄屏下主题切换可用。

---

## E · Entities（领域对象）

| Entity | Fields / meaning | Persistence |
| --- | --- | --- |
| ThemeState | `'light' \| 'dark' \| 'auto'` | `localStorage['404home:theme']` |
| ResolvedTheme | `'light' \| 'dark'`（auto 解析后实际生效值） | `<html data-theme>` 属性 |
| PrefersColorScheme | 浏览器系统偏好 | `matchMedia('(prefers-color-scheme: dark)')` |

无新增数据库表，无后端变更。

---

## A · Approach（方案与取舍）

### Chosen approach

1. **CSS 变量分层**：`:root` 定义亮色基线；`[data-theme='dark']` 覆盖暗色；`@media (prefers-color-scheme: dark)` 仅在 `[data-theme='auto']`（或无属性回退）下生效。
2. **切换锚点**：`<html data-theme="light|dark|auto">`，由 `theme.js` 维护，三态循环。
3. **防 FOUC**：`public/index.html` 内联一段同步脚本，挂载 Vue 前据 localStorage 设 `data-theme`。
4. **变量语义化**：新增 `--accent-strong`（侧栏/强调深蓝）、`--accent-ink`（反色文本统一）、`--ink-a5/a10/a35`、`--accent-a6/a25`、`--bg-a70/80/90/95`、`--bg-grad-start/grad-end`，消除全部 rgba 替身。
5. **后台侧栏跟随主题**：`AdminLayout` 改用 `var(--accent-strong)` 作底 + `var(--accent-ink)` 作文字，不再硬编码 `#16352a`。
6. **信号色保留**：`--hot` `--new` 不动，但其 rgba 背景改走变量派生。

### Alternatives considered

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| `.dark` class 切换 | 简单 | 与第三方 `.dark` 易冲突；语义弱 | 否，用 `data-theme` 属性 |
| `prefers-color-scheme` 纯 CSS | 零 JS | 无法手动覆盖、无持久化 | 否，仅作 auto 解析来源 |
| `data-theme` 三态 + 内联防 FOUC | 可控、可持久、无闪烁 | 需多写一段 index.html 脚本 | **是** |
| Tailwind dark: 变体 | 生态成熟 | 改造量大、与现有 BEM 风格冲突 | 否 |
| 多皮肤 JSON 配置 | 灵活 | 过度设计 | 否（首期两套足矣） |

---

## S · Structure（结构与依赖）

### Modules / files to touch

| Path | Change |
| --- | --- |
| `404home/src/assets/main.css` | 重写 `:root` 为亮蓝白；新增 `[data-theme='dark']`；补齐 `--accent-strong/--accent-ink/--ink-a*/--accent-a*/--bg-a*/--bg-grad-*`；body 渐变与 badge rgba 走变量 |
| `404home/src/utils/theme.js`（新） | `getTheme/setTheme/cycleTheme/applyTheme/resolveTheme` + `prefersDark` 监听 |
| `404home/src/components/ThemeToggle.vue`（新） | 三态切换按钮（亮/暗/自动图标） |
| `404home/public/index.html` | 注入内联 `<script>` 防 FOUC |
| `404home/src/main.js` | import `theme.js` 初始化（保险，HTML 脚本已先行） |
| `404home/src/components/AppHeader.vue` | 挂载 ThemeToggle；header 背景 rgba 改变量 |
| `404home/src/layouts/AdminLayout.vue` | 侧栏背景/文字/激活态全部走变量，跟随主题 |
| `404home/src/components/CategoryNav.vue` | 激活文字 `#f4fff8` → `var(--accent-ink)`；未激活底 rgba → `var(--bg-a80)` |
| `404home/src/components/AppFooter.vue` | 背景 rgba → `var(--bg-a70)` |
| `404home/src/components/SearchBar.vue` | 框 rgba → `var(--bg-a95)`；focus 描边 → `var(--accent-a25)` |
| `404home/src/components/ToolCard.vue` | hover/标签 rgba → `var(--ink-a10/a5)` |
| `404home/src/views/ToolDetail.vue` | tags rgba → `var(--ink-a5)` |
| `404home/src/views/Trial.vue` | session hover/气泡/composer/遮罩 rgba → 变量；`#fff` → `var(--bg-elevated)` |
| `404home/src/views/admin/{Categories,Posts,Tools}.vue` | 行遮罩 rgba → `var(--ink-a35)` |
| `404home/src/views/admin/Chats.vue` | 遮罩/textarea `#fff` → 变量 |
| `404home/src/views/user/Login.vue` | 输入框 `#fff` → `var(--bg-elevated)` |
| `404home/src/views/user/Register.vue` | 同上 |
| `404home/src/components/PasswordInput.vue` | `#fff` → `var(--bg-elevated)` |
| `docs/spdd/rag/knowledge/404home-theme-color.md`（新） | 沉淀主题变量与切换约定 |
| `docs/spdd/rag/index.md` | 追加 kh-006 |

### Dependencies / order

1. `main.css` 变量体系（亮 + 暗）。
2. `theme.js` + `ThemeToggle.vue`。
3. `index.html` 防 FOUC + `main.js` 初始化。
4. AppHeader 挂载 + 各组件硬编码清理。
5. AdminLayout 跟随主题。
6. build 验证 + RAG 沉淀。

---

## O · Operations（有序实现步骤）

### Op 1 · 重写 main.css 变量体系

- **Files**: `404home/src/assets/main.css`
- **Do**:
  - `:root`（亮色基线）：`--bg #f5f7fb`、`--bg-elevated #ffffff`、`--ink #0f172a`、`--ink-soft #475569`、`--line #e2e8f0`、`--accent #2563eb`（蓝）、`--accent-soft #dbeafe`、`--accent-strong #1d4ed8`、`--accent-ink #ffffff`、`--bg-grad-start #eef2ff`、`--bg-grad-end #e2e8f0`、`--ink-a5/a10/a35`、`--accent-a6/a25`、`--bg-a70/a80/a90/a95`、`--hot` `--new` 保留、`--shadow` 用 `--ink-a6`、`--radius` `--font-*` 不变。
  - `[data-theme='dark']`：`--bg #0f1115`、`--bg-elevated #161b22`、`--ink #e6edf3`、`--ink-soft #9aa7b8`、`--line #232a33`、`--accent #3b82f6`、`--accent-soft #1e2a44`、`--accent-strong #1d4ed8`、`--accent-ink #ffffff`、`--bg-grad-start #0b0d10`、`--bg-grad-end #161b22`、阴影加深。
  - body 渐变改用 `var(--bg-grad-start)` / `var(--bg)` / `var(--bg-grad-end)`，径向光晕用 `var(--accent-a6)`。
  - `.btn-primary` 文字 `var(--accent-ink)`；`.field input` 背景 `var(--bg-elevated)`；`.badge-*` rgba 改 `color-mix` 或新增 `--hot-a12/--new-a12` 派生变量（用 rgba 写在 `:root` 与 dark 各自块，保持简单）。
- **Done when**: 亮/暗两态变量齐备；源码内不再出现旧松绿/米黄 hex；暗色态生效。

### Op 2 · theme.js + ThemeToggle.vue

- **Files**: `404home/src/utils/theme.js`、`404home/src/components/ThemeToggle.vue`
- **Do**:
  - `theme.js`：常量 `THEMES = ['light','dark','auto']`、`STORAGE_KEY='404home:theme'`；`getStoredTheme()`、`resolveTheme(t)`（auto→`prefers-color-scheme`）、`applyTheme(t)`（设 `document.documentElement.dataset.theme = t`，注意：始终设为三态值，CSS 用 `[data-theme='dark']` + `auto` 下 media 覆盖）、`cycleTheme()`、`initTheme()`、`watchSystem()`。
  - `ThemeToggle.vue`：按钮 + 三态图标（☀/☾/自动），点击 `cycleTheme()`；当前态用 `ref` 反馈。
- **Done when**: 三态可循环、刷新保留、auto 跟随系统实时变化。

### Op 3 · 防 FOUC + main.js 初始化

- **Files**: `404home/public/index.html`、`404home/src/main.js`
- **Do**: index.html `<head>` 内联 `<script>` 读 localStorage 设 `data-theme`（默认 auto）；`main.js` import `./utils/theme` 调 `initTheme()` 保险。
- **Done when**: 刷新无主题闪烁。

### Op 4 · AppHeader 挂载 + 各组件硬编码清理

- **Files**: AppHeader、CategoryNav、AppFooter、SearchBar、ToolCard、ToolDetail、Trial、admin/{Categories,Posts,Tools,Chats}、user/{Login,Register}、PasswordInput
- **Do**: 按清单逐处把 rgba 替身与 `#fff` 替换为变量；AppHeader `.header-actions` 内挂载 `<ThemeToggle />`。
- **Done when**: 全站硬编码 rgba/#fff 清零；ThemeToggle 显示在顶栏。

### Op 5 · AdminLayout 跟随主题

- **Files**: `404home/src/layouts/AdminLayout.vue`
- **Do**: `.side` 背景 `var(--accent-strong)`、文字 `var(--accent-ink)`；nav 链接 `var(--accent-ink-a80)`；激活态 `var(--accent-ink-a12)` 底 + `var(--accent-ink)` 文字；退出按钮边框 `var(--accent-ink-a20)`。
- **Done when**: 亮/暗两态下侧栏可读、与前台主题一致。

### Op 6 · 构建验证 + RAG 沉淀

- **Files**: 终端、`docs/spdd/rag/knowledge/404home-theme-color.md`、`docs/spdd/rag/index.md`
- **Do**: `npm run build` 通过；写知识块（变量清单、切换机制、防 FOUC 约定）；index.md 追加 kh-006。
- **Done when**: build 绿；index 可检索到主题色知识块。

---

## N · Norms（怎么写）

- Stack conventions: Vue 3 + Vue CLI；主题切换纯 CSS 变量 + `data-theme` 属性；不动后端。
- UI / naming: 主题状态枚举 `light|dark|auto`；localStorage key `404home:theme`；切换组件命名 `ThemeToggle`。
- CSS: 变量统一在 `:root` 与 `[data-theme='dark']`；rgba 派生以语义命名（`--ink-a10`）；不再写裸 rgba/hex 于组件 scoped style。
- Testing: 每步手工验收（亮/暗/auto 三态切换、刷新、系统切换、后台侧栏）；build 通过即视为达成。

---

## S · Safeguards（不许做什么）

- Must not: 在前端代码或仓库中保留 DeepSeek / 微信 / 邮件密钥（与本主题无关，但禁止顺手碰）。
- Must not: 用 JS 改 `<body>` 内联颜色而绕过 CSS 变量。
- Must not: 保留任何旧松绿/米黄 hex（`#1f5b45` `#dceae2` `#f3efe6` `#fffdf8` `#d8d0c2` `#16352a` `#eef7f1` `#f7fff9` `#f4fff8` `#f7f3eb` `#ebe4d7`）。
- Must not: 改 `--hot` `--new` 语义色（产品信号稳定）。
- Must not: 引入 Tailwind / CSS-in-JS / 多皮肤配置。
- Security: localStorage 仅存主题偏好，无敏感信息；index.html 内联脚本只读 localStorage 设属性，不引入外部资源。
- Rollback / data: 主题切换无数据回滚需求；切换失败回退 auto。

---

## Sync log

| Date | Drift | Action |
| --- | --- | --- |
| 2026-10-08 | 初稿，代码未实现 | 建立主题色改版契约 |
| 2026-10-08 | 决策确认：深灰夜间 / 三态开关 / 后台跟随主题 | canvas 定稿，进入实现 |
