# REASONS Canvas · C 端认证弹窗 + 隐藏管理 + 登录缓存

- Date: 2026-10-13
- Status: synced
- Related analysis: —
- Related ADR: `docs/spdd/2-adr决策/ADR-20261013-auth-modal-cache.md` · `ADR-20261013-login-cache-email-only.md`
- Code anchors: `AppHeader.vue`、`AuthModal.vue`、`useAuthModal.js`、`MainLayout`/`router`、`Trial.vue`

---

## R · Requirements

### Business goal

登录注册不打断浏览；不对普通用户暴露后台入口；记住账号密码降低重复输入。

### In scope

- AuthModal（登录/注册切换）
- Header：按钮开弹窗；移除「管理」
- Trial：按钮开弹窗
- `/login` `/register` 深链 → 开弹窗并 replace
- localStorage 仅记住邮箱；会话靠 JWT（见 email-only ADR）

### Out of scope

- 微信登录、改后端 API
- 密码加密存储 / 生物识别
- 隐藏 `/admin` URL 本身

### Acceptance criteria

- [x] Header 登录/注册打开弹窗，不整页跳转
- [x] Trial 未登录按钮同样开弹窗
- [x] 访问 `/login`、`/register` 会开对应弹窗
- [x] Header 无「管理」链接
- [x] 勾选记住后再次打开登录弹窗只回填邮箱（不缓存/不回填密码）
- [x] 取消记住并登录成功后邮箱缓存被清除
- [x] 保持登录仅依赖 `404home_user_token` JWT

---

## E · Entities

| Entity | Fields / meaning | Persistence |
| --- | --- | --- |
| AuthModalState | open, mode(login\|register), redirect | 内存 |
| LoginCache | email only | `localStorage['404home_login_cache']` |
| UserJwt | Bearer token | `localStorage['404home_user_token']` |

---

## A · Approach

共享 `useAuthModal` + 单例 `AuthModal` 挂在 MainLayout；router beforeEach 处理深链。管理入口仅移除 UI。

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| 弹窗 | 不离开上下文 | 需全局状态 | 采用 |
| 保留独立页 | 实现简单 | 打断浏览 | 否为主路径 |

---

## S · Structure

| Path | Change |
| --- | --- |
| `composables/useAuthModal.js` | 新建 |
| `composables/useLoginCache.js` | 新建读写缓存 |
| `components/AuthModal.vue` | 新建 |
| `layouts/MainLayout.vue` | 挂载 AuthModal |
| `components/AppHeader.vue` | 开弹窗；去管理链 |
| `views/Trial.vue` | 开弹窗 |
| `router/index.js` | 深链桥接 |
| `views/user/Login.vue` / `Register.vue` | 可保留空壳或最小占位 |

### Dependencies / order

1. composables → AuthModal → MainLayout
2. Header / Trial / router
3. 资产文档已先于代码（本画布）

---

## O · Operations

### Op 1 · composables + AuthModal

- **Files**: `useAuthModal.js`、`useLoginCache.js`、`AuthModal.vue`
- **Do**: 弹窗 UI、登录注册逻辑、缓存读写与「记住账号密码」
- **Done when**: 可独立打开完成登录/注册

### Op 2 · 挂载与入口

- **Files**: MainLayout、AppHeader、Trial、router
- **Do**: 接线；隐藏管理；深链 replace
- **Done when**: AC 全过手测

### Op 3 · 资产 sync

- **Files**: auth 规范/边界/条例
- **Do**: 与实现一致
- **Done when**: Related 链齐全

---

## N · Norms

- CSS 变量 / `card-panel` 风格；遮罩可点关；Esc 关闭
- 成功后 `close` + 刷新 Header 用户态（watch token 或自定义事件 / 回调）
- 缓存键名固定 `404home_login_cache`

---

## S · Safeguards

- Must not: 把管理入口换个名字仍展示给 C 端
- Must not: 缓存写入前端仓库或示例密码进 git
- Must not: 用 admin token 当 user
- `/admin` URL 仍可用（故意保留）

---

## Sync log

| Date | Drift | Action |
| --- | --- | --- |
| 2026-10-13 | 无（首版落地） | AuthModal + 隐藏管理 + login cache；更新 auth 资产 |
| 2026-10-13 | 密码缓存不安全 | 改为仅缓存邮箱；会话只靠 JWT（ADR-login-cache-email-only） |
