# ADR-20261013 · C 端登录注册弹窗、隐藏管理入口、记住账号密码

- Status: accepted
- Date: 2026-10-13
- Deciders: user + AI
- Related canvas: `docs/spdd/canvases/20261013-auth-modal-cache.md`
- Supersedes: `404home-auth` 中「路由页 `/login` `/register` 为唯一入口」的交互约定
- Superseded by: `ADR-20261013-login-cache-email-only.md`（缓存项：仅邮箱，不再存密码）

## Context

Header 登录/注册跳独立页打断浏览；「管理」链对普通用户可见；希望账号密码可本地记住以便再次登录。

## Decision

1. C 端登录/注册改为 **弹窗（AuthModal）**，Header 与 Trial 等入口打开弹窗；`/login`、`/register` 深链仍可用，进入后打开对应弹窗并 `replace` 回 redirect 或首页。
2. 前台 Header **移除「管理」按钮**；后台仍可通过直接访问 `/admin`（及 `/admin/login`）进入，不对 C 端用户展示入口。
3. ~~记住账号密码（email+password）~~ → 见 superseding ADR：仅记住邮箱；会话靠 JWT。
4. ~~明文密码缓存~~ → 已废止。

## Consequences

**Positive**

- 登录不离开当前页；管理入口不对游客展示

**Negative / Trade-offs**

- 本机共享浏览器可读到缓存密码
- 独立 Login/Register 页变为路由桥接，不再作为主 UI

## Follow-ups

- [x] 更新 auth 规范 / 边界 / 条例 + 画布
- [x] 实现 AuthModal、Header/Trial/router
- [x] 自动化 TC 首批 → `ADR-20261013-test-stack.md`（API + loginCache；弹窗 UI 仍手测）
