# 规范 · C 端用户认证

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261013-login-cache-email-only.md`
- Related canvas: `docs/spdd/canvases/20261013-auth-modal-cache.md`
- Related tests: `3-测试边界/404home-auth.md` · `4-测试条例/404home-auth-cases.md`
- Updated: 2026-10-13
- Source confidence: high（本轮交互变更）

## 1. Scope

C 端注册/登录（弹窗）、验证码、user JWT、记住邮箱。微信 OAuth / 账号合并见 `404home-deepseek-trial.md`。后台管理入口不对 C 端展示。

## 2. Rules

1. C 端用户表与 `admins` **分离**；字段含 email UNIQUE、password_hash、vip/balance 相关列。
2. 注册发放试用额度：**¥3 = 300 分**，`balance_cap` 初始 **300**（与钱包规范一致）。
3. 注册需服务端验证码（内存 Map，TTL 约 5 分钟）；登录：邮箱 + 密码。
4. C 端 JWT 含 `role: user`；前端存储键 **`404home_user_token`**（与 admin token 分开）。
5. **交互**：登录/注册以 **AuthModal 弹窗** 为主路径；Header、Trial 等打开弹窗，不强制整页跳转。
6. 深链 `/login`、`/register` 仍可用：打开对应弹窗后 `replace` 到 `redirect` 或首页。
7. `/api/user/*` 需 user token；admin JWT **不得**冒充 user（反之亦然）。
8. 密码 bcrypt；密钥不写死在前端。
9. **记住邮箱**：可选；键 **`localStorage['404home_login_cache']`**，JSON `{ email }` 仅；打开登录弹窗只回填邮箱。**禁止**缓存密码。保持登录只靠 **`404home_user_token`（JWT）**。
10. 前台 Header **不展示「管理」**；后台仅通过直接访问 `/admin`（`/admin/login`）。
11. P0 **不做**：微信登录、强制邮箱验证链接、域名/证书依赖。
12. 生产环境**禁止**关闭验证码。

## 3. Examples

**Good**

- 在 `/trial` 点登录弹出层，成功后仍留在试用页并刷新用户态。
- 勾选记住后下次打开弹窗只回填邮箱；已登录用户靠 JWT 无需再登。

**Bad**

- Header 显示「管理」给普通访客。
- 用 admin token 调用户接口。

## 4. Enforcement

- Code anchors：`useAuthModal.js`、`useLoginCache.js`、`AuthModal.vue`、`AppHeader.vue`、`Trial.vue`、`router/index.js`
- 与 `404home-architecture.md` 双角色规则交叉检查
