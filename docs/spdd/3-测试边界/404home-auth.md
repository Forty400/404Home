# 测试边界 · C 端用户认证

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261013-login-cache-email-only.md`
- Related canvas: `docs/spdd/canvases/20261013-auth-modal-cache.md`
- Related 条例: `docs/spdd/4-测试条例/404home-auth-cases.md`
- Related 规范: `docs/spdd/1-资产规范/404home-auth.md`
- Updated: 2026-10-13

## 1. System under test

AuthModal、useAuthModal、useLoginCache、注册/登录 API、`404home_user_token`、Header/Trial 入口、路由深链桥接。

## 2. In scope

- 弹窗打开/关闭/登录↔注册切换
- 验证码注册；登录发 user JWT；赠金 300
- 记住邮箱读写与清除；缓存中不得出现密码字段
- 登录态依赖 JWT，不靠缓存密码
- Header 无「管理」；`/admin` URL 仍可进
- `/login` `/register` 深链开弹窗
- user/admin 角色不可互换

## 3. Out of scope（刻意不测）

- 微信 OAuth、合并、30 天冷却
- 密码加密存储强度
- 短信/小程序

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| 误缓存密码 | XSS 可读密码 | 断言 cache 无 password |
| 管理入口泄露 | 后台暴露 | P0 无 Header 链 |
| 弹窗后用户态不刷新 | 假未登录 | 成功后 Header 显示邮箱 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| captcha / user API | Real | |
| localStorage | Real | |

## 6. Environments

- Local: 前后端联调
- CI: 本地 `cd 404home && npm test`（server node:test + vitest）；CI 门禁待接
- Forbidden: 生产关 captcha；提交真实密钥
