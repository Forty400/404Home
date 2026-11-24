# 1 · 资产规范

跨功能、可复用的**稳定约定**：领域规则、API/错误码、命名、质量门、UI/交互基线等。

## 何时写

- ADR 已定稿，且决策需要变成长期约束时
- 测试边界/条例已对齐后，把「怎么做才算合规」写入规范
- **不要**把单次变更步骤写在这里（那是画布 Operations）

## 更新顺序中的位置

`ADR` → `测试边界` + `测试条例` → **资产规范** → 代码

## 模块索引（404Home）

| 模块 | 文件 | 状态来源 |
| --- | --- | --- |
| 架构基线 | [404home-architecture.md](./404home-architecture.md) | overview + trial |
| 工具详情 | [404home-tool-detail.md](./404home-tool-detail.md) | canvas 20261002 |
| 相关推荐 | [404home-related-tools.md](./404home-related-tools.md) | canvas 20261006 |
| 主题色 | [404home-theme.md](./404home-theme.md) | canvas 20261008 |
| C 端认证 | [404home-auth.md](./404home-auth.md) | canvas user-auth-p0 |
| UAT / 用户评价 | [404home-uat-guide.md](./404home-uat-guide.md) | uat.local + UX review |
| 钱包 / VIP | [404home-wallet.md](./404home-wallet.md) | admin-wallet + roadmap |
| DeepSeek 对话计费 | [404home-deepseek-chat.md](./404home-deepseek-chat.md) | deepseek-chat-p2 |
| 后台会话审计 | [404home-admin-chats.md](./404home-admin-chats.md) | admin-chats |
| 全站客服（话术+转人工） | [404home-customer-service.md](./404home-customer-service.md) | canvas 20261024 |
| 站内访问量 | [404home-site-analytics.md](./404home-site-analytics.md) | canvas 20261024 |
| 试用产品纲领 | [404home-deepseek-trial.md](./404home-deepseek-trial.md) | roadmap（draft） |

回填决策：`docs/spdd/2-adr决策/ADR-20261012-backfill-specs-by-module.md`  
测试资产：`3-测试边界/` · `4-测试条例/`（见 `ADR-20261012-backfill-tests-by-module.md`）

## 命名

- 稳定主题：`<domain>-<topic>.md`（如 `404home-api-errors.md`）
- 或带日期的修订说明：`YYYYMMDD-<slug>.md`

## 模板

复制 `_template.md` 新建。
