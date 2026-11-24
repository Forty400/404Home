# 3 · 测试边界

定义某主题/功能的**测什么、不测什么、风险面与依赖**，是 TDD 的范围契约。

## 何时写

- ADR 已接受（或确认无新 ADR）之后
- 写测试条例与自动化测试之前
- 范围变化时先改边界，再改条例

## 更新顺序中的位置

`ADR` → **测试边界** + `测试条例` → `资产规范` → 代码

## 模块索引（404Home）

| 模块 | 边界 | 条例 |
| --- | --- | --- |
| 架构基线 | [404home-architecture.md](./404home-architecture.md) | [../4-测试条例/404home-architecture-cases.md](../4-测试条例/404home-architecture-cases.md) |
| 工具详情 | [404home-tool-detail.md](./404home-tool-detail.md) | [../4-测试条例/404home-tool-detail-cases.md](../4-测试条例/404home-tool-detail-cases.md) |
| 相关推荐 | [404home-related-tools.md](./404home-related-tools.md) | [../4-测试条例/404home-related-tools-cases.md](../4-测试条例/404home-related-tools-cases.md) |
| 主题色 | [404home-theme.md](./404home-theme.md) | [../4-测试条例/404home-theme-cases.md](../4-测试条例/404home-theme-cases.md) |
| 首页热门文章 | [404home-hot-articles.md](./404home-hot-articles.md) | [../4-测试条例/404home-hot-articles-cases.md](../4-测试条例/404home-hot-articles-cases.md) |
| SPDD 内容系列 | [404home-spdd-content.md](./404home-spdd-content.md) | [../4-测试条例/404home-spdd-content-cases.md](../4-测试条例/404home-spdd-content-cases.md) |
| UX 加载/时间戳 | [404home-ux-loading-trust.md](./404home-ux-loading-trust.md) | [../4-测试条例/404home-ux-loading-trust-cases.md](../4-测试条例/404home-ux-loading-trust-cases.md) |
| UX Week B/C | [404home-ux-week-bc.md](./404home-ux-week-bc.md) | [../4-测试条例/404home-ux-week-bc-cases.md](../4-测试条例/404home-ux-week-bc-cases.md) |
| UX Sprint A 闭环 | [404home-ux-sprint-a-loops.md](./404home-ux-sprint-a-loops.md) | [../4-测试条例/404home-ux-sprint-a-loops-cases.md](../4-测试条例/404home-ux-sprint-a-loops-cases.md) |
| UX Sprint B IA | [404home-ux-sprint-b-ia.md](./404home-ux-sprint-b-ia.md) | [../4-测试条例/404home-ux-sprint-b-ia-cases.md](../4-测试条例/404home-ux-sprint-b-ia-cases.md) |
| ICP / 页脚合规 | [404home-icp-compliance.md](./404home-icp-compliance.md) | [../4-测试条例/404home-icp-compliance-cases.md](../4-测试条例/404home-icp-compliance-cases.md) |
| C 端认证 | [404home-auth.md](./404home-auth.md) | [../4-测试条例/404home-auth-cases.md](../4-测试条例/404home-auth-cases.md) |
| 钱包 / VIP | [404home-wallet.md](./404home-wallet.md) | [../4-测试条例/404home-wallet-cases.md](../4-测试条例/404home-wallet-cases.md) |
| DeepSeek 对话 | [404home-deepseek-chat.md](./404home-deepseek-chat.md) | [../4-测试条例/404home-deepseek-chat-cases.md](../4-测试条例/404home-deepseek-chat-cases.md) |
| 后台会话审计 | [404home-admin-chats.md](./404home-admin-chats.md) | [../4-测试条例/404home-admin-chats-cases.md](../4-测试条例/404home-admin-chats-cases.md) |
| 全站客服 | [404home-customer-service.md](./404home-customer-service.md) | [../4-测试条例/404home-customer-service-cases.md](../4-测试条例/404home-customer-service-cases.md) |
| 站内访问量 | [404home-site-analytics.md](./404home-site-analytics.md) | [../4-测试条例/404home-site-analytics-cases.md](../4-测试条例/404home-site-analytics-cases.md) |
| 试用纲领 E2E | [404home-deepseek-trial.md](./404home-deepseek-trial.md) | [../4-测试条例/404home-deepseek-trial-cases.md](../4-测试条例/404home-deepseek-trial-cases.md) |

回填决策：`docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`

## 与测试条例的分工

| 资产 | 回答 |
| --- | --- |
| 测试边界 | 测哪些层/场景？刻意不测什么？假依赖谁？ |
| 测试条例 | 具体用例、优先级、Given/When/Then 意图 |

## 命名

`YYYYMMDD-<slug>.md` 或稳定主题名 `<domain>-<feature>.md`

## 模板

复制 `_template.md`。
