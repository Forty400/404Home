# 规范 · 钱包 / VIP / 后台充值

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-specs-by-module.md`
- Related canvas: `docs/spdd/canvases/20261007-admin-wallet-p1.md`、`20261007-deepseek-trial-roadmap.md`
- Related tests: `3-测试边界/404home-wallet.md` · `4-测试条例/404home-wallet-cases.md`
- Updated: 2026-10-12
- Source confidence: medium（P0 赠金已落地；后台充值/VIP AC 部分未勾选）

## 1. Scope

账本、余额、额度上限、VIP 档位与管理员充值。聊天扣费细则见 `404home-deepseek-chat.md`。

## 2. Rules

1. 账本表 `wallet_ledger`：`delta_cents` + reason（grant / chat / recharge / merge / admin…）。
2. 金额**整数分**；UI 可按元输入，入库为分。
3. 余额**不得为负**；充值受当前 `balance_cap_cents` 约束（超额默认截断至 cap，除非另有 ADR）。
4. **禁止**无账本直接改 `users.balance`。
5. 管理端：`/admin/users` 展示邮箱、余额、VIP、累计充值；API `GET /api/wallet/users`、`POST /api/wallet/admin-credit` **仅 admin JWT**。
6. 管理员充值计入累计充值，并按 `server/config/vipTiers.js` 升级 VIP。
7. VIP 档位基线（可配置）：普通 ¥3、vip1 ¥10、vip2 ¥20、vip10 ¥100；阈值=档位 cap；升级时提高 `balance_cap`，账本增加 `(new_cap - old_cap)`；跨档按起止档差一次结算。
8. 用户 token **不得**调用 admin-credit。

## 3. Examples

**Good**

- 充值走 ledger + 更新余额/VIP；列表仅 admin 可见。

**Bad**

- `UPDATE users SET balance = …` 无 ledger；用户 JWT 打 admin-credit。

## 4. Enforcement

- Code anchors：wallet routes/services、`AdminUsers.vue`、`vipTiers.js`
- 与 architecture「分 + 账本」规则交叉检查
