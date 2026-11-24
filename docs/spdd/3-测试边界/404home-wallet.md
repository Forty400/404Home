# 测试边界 · 钱包 / VIP / 后台充值

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261015-portfolio-freeze.md`
- Related canvas: `docs/spdd/canvases/20261013-portfolio-tech-showcase.md`（作品集）；`docs/spdd/canvases/20261007-admin-wallet-p1.md`
- Related 条例: `docs/spdd/4-测试条例/404home-wallet-cases.md`
- Related 规范: `docs/spdd/1-资产规范/404home-wallet.md`
- Updated: 2026-10-15

## 1. System under test

`wallet_ledger`、余额/cap、VIP 档位、`/api/wallet/*`、`AdminUsers` 充值。

## 2. In scope

- 账本必记；禁止无 ledger 改余额
- 余额非负；充值受 cap
- admin-credit 仅 admin JWT；计入累计充值与 VIP 升级规则
- 元输入 ↔ 分存储（API 以 `amount_cents` 为准）

## 3. Out of scope（刻意不测）

- 第三方支付网关
- 聊天扣费公式细节（见 deepseek-chat）
- 全档 VIP 组合爆炸（覆盖跨档与单档升级即可）

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| 无账本改余额 | 对账失败 | P0 |
| 用户调 credit | 盗充 | P0 |
| 负余额 | 资损 | P0 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| vipTiers.js | Real | |
| admin JWT | Real（seed 或 jwt.sign） | |
| DB | 临时 SQLite（`DB_PATH`） | 见 Environments |

## 6. Environments

- Local / CI: `DB_PATH` 指向临时文件；先于 `require('../db')` 设置（见 `server/test/helpers.js`）
- CI: 无生产库、无真实支付
- Forbidden: 对生产用户批量 credit；测试写生产 `404home.db`
