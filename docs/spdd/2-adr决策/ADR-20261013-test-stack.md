# ADR-20261013 · 选定自动化测试栈（首批 P0）

- Status: accepted
- Date: 2026-10-13
- Deciders: user + AI
- Related canvas: `docs/spdd/canvases/20261012-spdd-asset-mgmt.md`
- Supersedes: `ADR-20261012-backfill-tests-by-module.md` follow-up「选定测试栈」
- Superseded by: —

## Context

条例已回填但无可执行测试。需在不大改 Vue CLI 结构的前提下落地首批自动化。

## Decision

1. **服务端**：Node 内置 `node:test` + `http` 调 Koa `app.callback()`；测试库用 `DB_PATH` 临时 SQLite；`CAPTCHA_DEBUG=1` 取验证码。
2. **前端**：`vitest` + `happy-dom`，优先测纯 composable（`useLoginCache` 等）；组件/E2E 后续再补。
3. 首批覆盖 auth 相关 P0：注册赠金、错验证码、登录 JWT、admin 不可冒充 user、邮箱缓存无密码。
4. 根脚本：`404home/package.json` → `test`（前后端串联）；`server/package.json` → `test`。

## Consequences

**Positive**

- 零/低额外后端依赖；前端单测不绑 Playwright

**Negative / Trade-offs**

- Header/Trial 弹窗 UI 仍需手测或后续组件测
- 临时 DB 需在测试进程内先设 `DB_PATH` 再 `require` 模块

## Follow-ups

- [x] `DB_PATH` + `createApp` 导出
- [x] server auth API 测试 + frontend loginCache 测试
- [x] 扩展 wallet/chat P0（`wallet-p0.test.js` / `chat-billing-p0.test.js` + `DEEPSEEK_STUB`）
- [ ] 可选 Playwright
