# 404Home UAT 账号配置模板（可提交）

复制为同目录 `uat.local.md` 后填写真实口令。  
`uat.local.md` 已被 gitignore，**勿提交**。

```bash
cp uat.local.example.md uat.local.md
```

完整测试步骤与权限矩阵见：  
`docs/spdd/1-资产规范/404home-uat-guide.md`

---

## 环境入口

| 环境 | 前台 | 管理后台 |
| --- | --- | --- |
| 本地 | `http://localhost:8080` | `http://localhost:8080/admin` |
| 生产（示例） | `https://forty40.online` 或 `http://111.230.147.223` | `/admin` |

## 角色账号（填真实值）

### 访客 guest

- 无需账号；清 Cookie / 退出登录后验收。

### C 端用户 user（SQLite `users`）

- 邮箱：`uat@404home.test`（seed 默认，可用 env `UAT_USER_EMAIL` 覆盖）
- 密码：`（填写；默认见 seed / server/.env 的 UAT_USER_PASSWORD）`
- 登录方式：前台 Header「登录」或 `/api/user/login`
- Token 键：`localStorage['404home_user_token']`

### 管理员 admin（SQLite `admins`）

- 用户名：`admin`（或 `ADMIN_USERNAME`）
- 密码：`（填写；与 server/.env 的 ADMIN_PASSWORD 一致）`
- 登录方式：`/admin` → `/api/auth/login`
- Token 键：`localStorage` 管理端 token（`404home_admin_token`）

## 备注

- admin 与 user **不可互冒** JWT。
- 评价宿主 UX（文章/工具/搜索）**不必**开 DeepSeek；试用计费另开一轮。
- 改密后同步更新本文件与生产 `server/.env`，并重启 `404home-api`。
