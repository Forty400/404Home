# REASONS Canvas · P0 C 端邮箱登录 + 试用页（桌面/手机 Web）

- Date: 2026-10-07
- Status: synced
- Related analysis: `docs/spdd/analysis/20261007-deepseek-trial.md`
- Code anchors: `404home/server/`、`404home/src/`

---

## R · Requirements（为什么、范围）

### Business goal

在**暂不配置域名**（D11）、生产可用 IP 访问的前提下，先交付 C 端**邮箱注册/登录**与 **DeepSeek 试用页壳**（桌面+手机响应式），与管理员体系隔离；为后续钱包扣费与模型代理打底。

### In scope

- `users` 表：邮箱、密码、vip_level、余额字段（注册赠送 ¥3=300 分，cap=300）。
- 图形验证码注册；邮箱+密码登录；C 端 JWT（`role: user`）。
- 前台：注册/登录页、试用页（会话 UI 可先本地占位；余额展示）、Header 入口；手机窄屏可用。
- Admin JWT 增加 `role: admin`，与 user 分离。

### Out of scope

- 域名 / HTTPS / 微信网站应用（D11 延后）。
- DeepSeek 真实调用（P2）。
- 累充升 VIP、管理员加额 UI（P1 细化可随后）。
- 邮箱验证链接强制（本阶段注册即发赠送金 + 验证码防刷）。

### Acceptance criteria

- [ ] 可用邮箱注册（过验证码）并登录，获得 300 分余额。
- [ ] `/api/user/*` 需 user token；admin token 不可冒充。
- [ ] `/trial` 桌面与手机可打开；未登录引导登录。
- [ ] 现有 `/admin` 登录不受影响。
- [ ] 不依赖域名；localhost 与 IP 部署均可。

---

## E · Entities（领域对象）

| Entity | Fields | Persistence |
| --- | --- | --- |
| User | email UNIQUE, password_hash, vip_level, balance_cents, balance_cap_cents, cumulative_recharge_cents, status, created_at, deleted_at | `users` |
| WalletLedger | user_id, delta_cents, reason, ref_id | `wallet_ledger`（注册 grant 一条） |
| Captcha | id → code（内存，TTL 5min） | 进程内存 Map |

---

## A · Approach（方案与取舍）

### Chosen approach

同库扩表；`svg`/`canvas` 式简易验证码（服务端生成）；bcrypt 密码；JWT claim 含 `role`。试用页先做布局与「即将接入模型」发送占位，余额从 `/api/user/me` 读。

### Alternatives considered

| Option | Decision |
| --- | --- |
| 先做纯 UI 无后端 | 否；需落账号与余额 |
| 本阶段接微信 | 否；D11 无域名 |

---

## S · Structure（结构与依赖）

| Path | Change |
| --- | --- |
| `404home/server/db.js` | users / wallet_ledger |
| `404home/server/middleware/auth.js` | `adminRequired` / `userRequired` |
| `404home/server/routes/auth.js` | admin JWT 加 `role: 'admin'` |
| `404home/server/routes/userAuth.js` | 验证码、注册、登录、me |
| `404home/server/services/captcha.js` | 验证码 |
| `404home/server/index.js` | 挂载路由 |
| `404home/server/.env.example` | 可选说明 |
| `404home/src/api/index.js` | user token + API |
| `404home/src/router/index.js` | /login /register /trial |
| `404home/src/views/user/Login.vue` | 登录 |
| `404home/src/views/user/Register.vue` | 注册 |
| `404home/src/views/Trial.vue` | 试用页响应式 |
| `404home/src/components/AppHeader.vue` | 试用/登录入口 |
| `404home/src/assets/main.css` | 必要移动端辅助 |

### Dependencies / order

1. Schema → middleware → userAuth → admin role fix  
2. Frontend api/router/pages → header → trial responsive  

---

## O · Operations（有序实现步骤）

### Op 1 · Schema

- **Files**: `404home/server/db.js`
- **Do**: 建 `users`、`wallet_ledger`；导出如需的 helper
- **Done when**: 重启 API 表存在

### Op 2 · Auth middleware

- **Files**: `middleware/auth.js`, `routes/auth.js`
- **Do**: `adminRequired`（role admin 或兼容旧 token 无 role 且来自 admin 登录）；`userRequired`（role user）；admin 登录签发 `role: 'admin'`
- **Done when**: 旧 admin 登录仍可用；user token 进不了 admin API

### Op 3 · Captcha + user auth API

- **Files**: `services/captcha.js`, `routes/userAuth.js`, `index.js`
- **Do**: GET captcha；POST register（校验验证码、建用户、ledger grant 300、cap 300）；POST login；GET me
- **Done when**: curl/前端可注册登录拿到余额 300

### Op 4 · Frontend auth + trial UI

- **Files**: api、router、Login/Register/Trial、AppHeader、main.css
- **Do**: 独立 `404home_user_token`；试用页展示余额与聊天壳；窄屏导航可用
- **Done when**: 本地可走完注册→试用页；手机宽度布局不崩

---

## N · Norms（怎么写）

- 金额整数分；错误 `{ error, code? }`。
- UI 纸感浅绿；不引入紫霓虹。
- 密码 bcrypt；不写死密钥进前端。

---

## S · Safeguards（不许做什么）

- 不接微信、不配域名证书（本画布）。
- 不调用 DeepSeek。
- 不把 user JWT 当 admin。
- 生产勿关验证码。

---

## Sync log

| Date | Drift | Action |
| --- | --- | --- |
| 2026-10-07 | 新建 | D11 下启动 P0 |
| 2026-10-07 | 实现完成 | Op1–4 已落地；DeepSeek 真调用留 P2 |
