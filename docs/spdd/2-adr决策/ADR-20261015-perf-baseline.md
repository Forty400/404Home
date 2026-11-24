# ADR-20261015 · 作品集期前端性能基线（C3）

- Status: accepted
- Date: 2026-10-18
- Deciders: user + AI
- Related canvas: `docs/spdd/canvases/20261013-portfolio-tech-showcase.md`
- Supersedes: —
- Superseded by: —

## Context

作品集窗口需要一条可复述的前端工程信号，且不与计费证据链并行做 Vite 全量迁移（见 `ADR-20261015-portfolio-freeze.md`）。`src/router/index.js` 的页面组件已全部 `() => import(...)`。

## Decision

1. **保持** Vue Router 路由级懒加载：页面与布局用动态 `import`，禁止把 `/trial`、`/admin/*` 等页面改回静态 import 打进入口。
2. **基线以生产构建为准**（`npm run build`，Vue CLI，2026-10-18，hash `250c469e1dc3ff1c`），不把 Lighthouse 分数当本窗口门禁（需在线 Demo 与浏览器，可复现性差）。
3. 记录当时量级，作为「变大了要解释」的对照，而不是绝对性能 KPI：
   - 入口：`chunk-vendors` **127.94 KiB / gzip 46.20 KiB**；`app` **12.44 KiB / gzip 4.71 KiB**；`app` CSS gzip **1.20 KiB**
   - 作品集主路径 `/trial` 独立 chunk：JS **7.25 KiB / gzip 3.13 KiB** + CSS gzip **1.28 KiB**（`dist/js/732.*.js`）
   - 最大异步 JS chunk：**15.09 KiB / gzip 5.43 KiB**
4. 本窗口**不做** Vite 迁移；若改选，新开 ADR 并重测上表。

## Consequences

**Positive**

- 首屏不打包全部页面；Trial 可单独指出分包体积
- 面试可引用一次真实 `vue-cli-service build` 输出，而非空口「做了优化」

**Negative / Trade-offs**

- 未跑 Lighthouse；未优化 vendor 体积（Vue 运行时约占入口大头）
- 数字会随依赖与页面变化，复测时更新本 ADR 或新开修订 ADR

## Follow-ups

- [x] 规范 `404home-architecture.md` 增加性能小节
- [x] README 亮点表增加本条
- [ ] 若 vendor gzip 明显超过 ~60 KiB，再评估拆依赖或 Vite（新 ADR）
