# 测试条例 · 钱包 / VIP / 后台充值

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261015-portfolio-freeze.md`
- Related boundary: `docs/spdd/3-测试边界/404home-wallet.md`
- Related canvas: `docs/spdd/canvases/20261013-portfolio-tech-showcase.md`
- Code tests: `404home/server/test/wallet-p0.test.js`
- Updated: 2026-10-15

## Cases

### TC-01 · 管理员列表用户钱包信息

- Priority: P0
- **Given**: admin JWT；库中有用户
- **When**: `GET /api/wallet/users` 或打开 `/admin/users`
- **Then**: 可见邮箱、余额、VIP、累计充值等字段
- **Notes**: 自动化见 `wallet-p0.test.js`

### TC-02 · admin-credit 更新余额与账本

- Priority: P0
- **Given**: admin JWT；目标用户
- **When**: `POST /api/wallet/admin-credit`（`amount_cents`）
- **Then**: 余额增加；`wallet_ledger` 有对应 `delta_cents`（reason `admin`）；累计充值增加
- **Notes**:

### TC-03 · 用户 JWT 不能 credit

- Priority: P0
- **Given**: user JWT
- **When**: 调用 admin-credit
- **Then**: 403；余额不变
- **Notes**:

### TC-04 · 余额不为负

- Priority: P0
- **Given**: 用户余额为 0
- **When**: 尝试 chat completions（交叉）
- **Then**: `INSUFFICIENT_BALANCE`；余额仍为 0
- **Notes**: 与 chat TC-02 交叉；本文件断言余额非负

### TC-05 · 充值受 cap 约束

- Priority: P1
- **Given**: 用户接近 `balance_cap_cents`
- **When**: 超额 credit
- **Then**: 不超过 cap（截断或拒绝，与规范一致）
- **Notes**: 作品集窗口延后自动化

### TC-06 · VIP 升级写账本差额

- Priority: P1
- **Given**: 累计充值跨过某档阈值
- **When**: credit 触发升级
- **Then**: `balance_cap` 提高；ledger 含 `(new_cap - old_cap)` 类差额
- **Notes**: 作品集窗口延后自动化

## Traceability

| Case | Code test | Boundary / Spec |
| --- | --- | --- |
| TC-01 | `wallet-p0` TC-01 | wallet §2 |
| TC-02 | `wallet-p0` TC-02 | wallet §2 |
| TC-03 | `wallet-p0` TC-03 | wallet §2 |
| TC-04 | `wallet-p0` TC-04 + chat TC-02 | wallet §2 |
| TC-05–06 | （延后） | wallet VIP |
