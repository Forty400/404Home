# REASONS Canvas · P1 管理端用户加额

- Date: 2026-10-07
- Status: synced
- Related analysis: `docs/spdd/analysis/20261007-deepseek-trial.md`

## R · Requirements

管理员可在后台查看 C 端用户列表，并按邮箱/金额（元）加额（走已有 `admin-credit`，含累充与 VIP 升档）。

## Acceptance

- [ ] `/admin/users` 列出用户（邮箱、余额、VIP、累充）
- [ ] 可对指定用户加额并看到更新后余额/等级
- [ ] 仅 admin JWT

## O · Operations

1. `GET /api/wallet/users` + 沿用 `POST /api/wallet/admin-credit`
2. `AdminUsers.vue` + 路由/侧栏
3. Dashboard 增加用户数（可选）

## Safeguards

- 不加额接口暴露给 user token
- 金额用分入库，UI 用元输入
