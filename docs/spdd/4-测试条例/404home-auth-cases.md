# 测试条例 · C 端用户认证

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261013-login-cache-email-only.md`
- Related boundary: `docs/spdd/3-测试边界/404home-auth.md`
- Related canvas: `docs/spdd/canvases/20261013-auth-modal-cache.md`
- Code tests:
  - `404home/server/test/user-auth.test.js`（TC-01/02/03/09 + 未认证 401）
  - `404home/src/composables/useLoginCache.spec.js`（TC-06/06b/07）
  - 运行：`cd 404home && npm test`
- Updated: 2026-10-13

## Cases

### TC-01 · 验证码注册并获赠金

- Priority: P0
- **Given**: 有效验证码与新邮箱；打开注册弹窗
- **When**: 完成注册
- **Then**: 弹窗关闭；余额 **300** 分；Header 显示邮箱
- **Notes**:

### TC-02 · 弹窗登录得 user token

- Priority: P0
- **Given**: 已注册用户；Header 点登录
- **When**: 提交正确邮箱密码
- **Then**: 存在 `404home_user_token`；不整页跳到 `/login`；Header 显示用户
- **Notes**:

### TC-03 · 无验证码/错验证码注册失败

- Priority: P0
- **Given**: 错误或缺失验证码
- **When**: 提交注册
- **Then**: 失败，弹窗仍开；不发放额度
- **Notes**:

### TC-04 · Trial 未登录开弹窗

- Priority: P0
- **Given**: 无 user token；在 `/trial`
- **When**: 点登录或注册
- **Then**: 打开 AuthModal（对应模式）；URL 不必变成 `/login`
- **Notes**:

### TC-05 · Header 无管理入口

- Priority: P0
- **Given**: 前台任意页（未特别配置）
- **When**: 查看 Header
- **Then**: 无「管理」链接；直接访问 `/admin` 仍可达登录/后台
- **Notes**:

### TC-06 · 记住邮箱回填且不存密码

- Priority: P0
- **Given**: 登录时勾选记住并成功
- **When**: 退出后再打开登录弹窗；检查 `404home_login_cache`
- **Then**: 邮箱已回填；密码框为空；cache JSON **无** `password` 字段
- **Notes**:

### TC-07 · 取消记住则清除邮箱缓存

- Priority: P1
- **Given**: 已有邮箱缓存
- **When**: 打开登录弹窗取消勾选并成功登录
- **Then**: `404home_login_cache` 被清除
- **Notes**:

### TC-06b · 旧缓存含 password 时迁移剥离

- Priority: P1
- **Given**: localStorage 中旧格式 `{ email, password: "x" }`
- **When**: 打开登录弹窗（触发 load）
- **Then**: 密码不回填；写回后 cache 仅含 email
- **Notes**:

### TC-08 · 深链 /login 开弹窗

- Priority: P1
- **Given**: 访问 `/login?redirect=/trial`
- **When**: 路由处理完成
- **Then**: 出现登录弹窗；URL replace 为 `/trial`（或约定首页+redirect）
- **Notes**:

### TC-09 · admin token 不能当作用户

- Priority: P0
- **Given**: 仅 admin JWT
- **When**: 调用户受保护接口
- **Then**: 拒绝
- **Notes**:

## Traceability

| Case | Boundary section | Spec / ADR |
| --- | --- | --- |
| TC-01–03 | 注册登录 | auth §2.2–2.5 |
| TC-04 | 弹窗入口 | auth §2.5 |
| TC-05 | 隐藏管理 | auth §2.10 |
| TC-06–07 / 06b | 仅邮箱缓存 | auth §2.9 · email-only ADR |
| TC-08 | 深链 | auth §2.6 |
| TC-09 | 角色 | auth §2.7 |
