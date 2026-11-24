# ADR-20261013 · 登录缓存仅邮箱，会话只靠 JWT

- Status: accepted
- Date: 2026-10-13
- Deciders: user + AI
- Related canvas: `docs/spdd/canvases/20261013-auth-modal-cache.md`
- Supersedes: `ADR-20261013-auth-modal-cache.md` 决策第 3–4 条（明文缓存密码）
- Superseded by: —

## Context

曾用 `404home_login_cache` 存 email+password。用户希望更安全；项目已用 JWT（`404home_user_token`，约 30d）维持登录态。

## Decision

1. **禁止**在 localStorage（或其它前端持久化）缓存密码。
2. 「记住账号」仅缓存 **邮箱**：`localStorage['404home_login_cache']` → JSON `{ email }`；打开登录弹窗只回填邮箱。
3. **保持登录**只依赖既有 user JWT；退出时清 token，不把密码当会话手段。
4. 读取旧缓存若含 `password` 字段：忽略且写回时剥离（迁移清密）。

## Consequences

**Positive**

- XSS 无法从缓存直接偷到密码；与 JWT 职责分离清晰

**Negative / Trade-offs**

- 再次登录需手输或靠浏览器密码管理器填密码

## Follow-ups

- [x] 改 `useLoginCache` / AuthModal
- [x] 更新 auth 规范 / 边界 / 条例 / 画布
