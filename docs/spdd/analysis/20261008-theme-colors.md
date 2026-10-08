# Analysis · 项目主题色（亮/暗）

- Date: 2026-10-08
- Author: SPDD cycle（用户需求录入）
- Status: ready
- Related canvas: `docs/spdd/canvases/20261008-theme-colors.md`

## Decisions log（已拍板）

| ID | Date | Decision |
| --- | --- | --- |
| D1 | 2026-10-08 | **亮色**：接近 DeepSeek 蓝白——白/冷灰白画布 + 品牌蓝强调（参考 `#4D6BFE`），告别当前纸感浅绿。 |
| D2 | 2026-10-08 | **暗色**：采用通用热门款式——近黑/slate 画布、浅字、克制强调色（非霓虹紫、非赛博发光）。 |
| D3 | 2026-10-08 | **全站含 `/admin`**：主题挂在 `document.documentElement`，前后台共用 CSS 变量。 |
| D4 | 2026-10-09 | **默认 system**；三态 `system \| light \| dark`；键 `404home-theme-pref`；`system` 监听 OS。 |
| D5 | 2026-10-08 | **字体本期不动**（Fraunces 等另开）；Trial 用全局 token，不单独主题文件。 |

## 1. Problem

404Home 当前全局样式为纸感暖绿（`main.css` 中 `--bg: #f3efe6`、`--accent: #1f5b45`），与站内 DeepSeek 试用产品气质不一致，也缺少亮/暗切换。用户长时间试用对话时，无法按环境或偏好切换主题。

不做则：视觉与主流 AI 产品脱节；暗环境刺眼；后续 Trial / 账号页各自硬编码颜色，主题债会越滚越大。

## 2. Goals / Non-goals

**Goals**

- 建立 **CSS 变量主题层**（`data-theme="light|dark"` 或等价），业务组件尽量只消费变量，不写死色值。
- **亮色**：DeepSeek 风蓝白——白画布、冷灰边框/次要字、主色蓝（≈ `#4D6BFE`）、浅蓝软底（≈ `#EAEFFE` / `#F3F5FE`）。
- **暗色**：通用热门暗色——背景 ≈ `#0f1117` / `#12141a`，elevated ≈ `#1a1d27`，文字近白，边框低对比灰，accent 可用同系蓝略提亮以保证对比度。
- Header（或等效位置）提供 **亮 / 暗 /（可选）跟随系统** 切换；偏好持久化。
- 覆盖前台主路径：首页、工具详情、Trial、登录注册、资讯/教程；避免半套主题。

**Non-goals**

- 不做多套可配品牌色（仅 light/dark 两套）。
- 不做用户自定义取色器 / 后台主题配置 CMS。
- 首期不强制改动插画/外链工具图标本身。
- 不引入重型 UI 库仅为了主题。

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| 访客 | 打开首页，视觉为蓝白 AI 产品感 | 一眼不像旧纸感绿站 |
| 试用用户 | 夜间用 `/trial` 对话，切到暗色 | 背景暗、字清晰、无刺眼白块 |
| 回访用户 | 上次选暗色，再次打开 | 仍为暗色（若 D4 选记忆） |
| 管理员 | 进 `/admin` | 按 D3：同主题或保持现状，行为明确 |

## 4. Constraints

- Tech: Vue 3；全局样式入口 `404home/src/assets/main.css`，已有 `:root` 变量可扩展为双主题；无现成 dark 实现。
- Design debt: `.cursor/rules/404home-conventions.mdc` 写明「保持纸感浅绿」——本需求 **有意推翻**，画布落地后需同步改该约定与 RAG（若沉淀）。
- A11y: 主按钮/链接对比度 WCAG AA；暗色勿纯 `#000` 大面积 + 纯白字造成眩光。
- Time: 适合独立小迭代；建议先 token + 壳层，再扫组件硬编码。
- Ops / security: 纯前端主题，无后端密钥；`localStorage` 即可。

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 组件内硬编码色/内联 style | 切暗色后花斑 | 画布列清单；grep 扫 `#` / `rgb`；优先变量 |
| 蓝白做成「DeepSeek 山寨」 | 品牌混淆 | 蓝作 accent，品牌名/logo 仍为 404Home；不抄词标与吉祥物 |
| 暗色做成霓虹模板 | 与 D2 冲突 | 禁紫渐变/glow；参考 GitHub/ChatGPT 克制 slate |
| 后台未纳入导致割裂 | 体验不一致 | D3 明确；首期可「仅前台」写进 Non-goals |

## 6. 建议色板（分析级，画布可微调）

### Light（DeepSeek-adjacent）

| Token | 建议值 | 用途 |
| --- | --- | --- |
| `--bg` | `#F5F7FB` 或 `#FFFFFF` | 页面底 |
| `--bg-elevated` | `#FFFFFF` | 卡片 |
| `--ink` | `#0F172A` / `#000000` 系 | 主文字 |
| `--ink-soft` | `#475569` | 次要文字 |
| `--line` | `#E5E7EB` | 边框 |
| `--accent` | `#4D6BFE` | 主按钮 / 链接强调 |
| `--accent-soft` | `#EAEFFE` | 浅底、hover |
| `--hot` / `--new` | 保留语义色，微调饱和度适配冷色底 | 热门/上新标签 |

氛围：可选极淡顶→底冷灰白渐变（参考 DeepSeek `#D6DBDC` → `#FFF`），勿大面积填蓝。

### Dark（popular generic）

| Token | 建议值 | 用途 |
| --- | --- | --- |
| `--bg` | `#0F1117` | 页面底 |
| `--bg-elevated` | `#1A1D27` | 卡片 |
| `--ink` | `#E8EAED` | 主文字 |
| `--ink-soft` | `#9AA0A6` | 次要文字 |
| `--line` | `#2A2F3A` | 边框 |
| `--accent` | `#6B85FF` 或保持 `#4D6BFE`（测对比度） | 主操作 |
| `--accent-soft` | `#1E2438` | 浅底/hover |
| `--shadow` | 低透明度黑，避免亮色阴影 | 抬升 |

## 7. Open Questions

- [x] Q1–Q3、Q5 → 见 D3–D5 / 画布（「继续」时按默认拍板）
- [x] Q4 → D5 字体另开

## 8. Acceptance Criteria（建议）

1. 前台任意页可在一处切换 light/dark，整页（含 Header/Footer/卡片/按钮）同步变色，无大块未适配白/绿残留。
2. 亮色主强调色视觉接近 DeepSeek 蓝（`#4D6BFE` 邻域），背景为白/冷灰白而非暖米黄/绿。
3. 暗色为克制 slate 暗色，无紫色霓虹、无强 glow。
4. 刷新后主题偏好按 D4 约定恢复。
5. 无障碍：主按钮文字与底对比度 ≥ 4.5:1（抽样检测）。

## 9. Recommended Next

→ 已实现并 synced；RAG：`docs/spdd/rag/knowledge/404home-theme.md`（kh-006）。  
→ 主题闭环完成；后续改色板或加 Admin 专用切换时先改画布再 `spdd-generate`。
