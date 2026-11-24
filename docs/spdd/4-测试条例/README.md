# 4 · 测试条例

可验收的**用例级意图**（Given / When / Then）、优先级与失败含义。配合测试边界做 TDD：先条例（及失败测试），再实现。

## 何时写

- 对应 `3-测试边界` 已对齐之后（可同批提交）
- 实现功能代码之前或并行先写失败测试
- 行为变更时同步改条例，再 `spdd-sync` 画布

## 更新顺序中的位置

`ADR` → `测试边界` + **测试条例** → `资产规范` → 代码

## 模块索引（404Home）

见 [../3-测试边界/README.md](../3-测试边界/README.md) 对照表。本目录文件均为 `404home-*-cases.md`。

| 文件 | P0 用例数（约） |
| --- | --- |
| [404home-architecture-cases.md](./404home-architecture-cases.md) | 4 |
| [404home-tool-detail-cases.md](./404home-tool-detail-cases.md) | 3 |
| [404home-related-tools-cases.md](./404home-related-tools-cases.md) | 4 |
| [404home-theme-cases.md](./404home-theme-cases.md) | 4 |
| [404home-hot-articles-cases.md](./404home-hot-articles-cases.md) | 4 P0 + 2 P1 |
| [404home-spdd-content-cases.md](./404home-spdd-content-cases.md) | 4 P0 + 1 P1 |
| [404home-ux-loading-trust-cases.md](./404home-ux-loading-trust-cases.md) | 5 P0 |
| [404home-ux-week-bc-cases.md](./404home-ux-week-bc-cases.md) | 6 P0 |
| [404home-ux-sprint-a-loops-cases.md](./404home-ux-sprint-a-loops-cases.md) | 4 P0 |
| [404home-ux-sprint-b-ia-cases.md](./404home-ux-sprint-b-ia-cases.md) | 5 P0 |
| [404home-icp-compliance-cases.md](./404home-icp-compliance-cases.md) | 2 P0 + 1 P1 |
| [404home-auth-cases.md](./404home-auth-cases.md) | 5 |
| [404home-wallet-cases.md](./404home-wallet-cases.md) | 4 |
| [404home-deepseek-chat-cases.md](./404home-deepseek-chat-cases.md) | 6 |
| [404home-admin-chats-cases.md](./404home-admin-chats-cases.md) | 4 |
| [404home-customer-service-cases.md](./404home-customer-service-cases.md) | 6 P0 |
| [404home-site-analytics-cases.md](./404home-site-analytics-cases.md) | 4 P0 |
| [404home-deepseek-trial-cases.md](./404home-deepseek-trial-cases.md) | 4 |
| [404home-tool-rag-mcp-cases.md](./404home-tool-rag-mcp-cases.md) | 见文件 |
| [404home-article-ingest-review-cases.md](./404home-article-ingest-review-cases.md) | 7 P0 |

`Code tests`：**部分已落地**（`404home/npm test`：auth / wallet / chat / architecture 等 P0；DeepSeek 用 `DEEPSEEK_STUB=1`）。条例中的 `Code tests` 链接仍可能滞后，审查时以仓库测试文件为准。

Harness 模块对照：`../1-资产规范/404home-harness-modules.md` · 审查底稿 `../analysis/20261125-harness-module-requirements.md`  
回填决策：`docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`

## 命名

`YYYYMMDD-<slug>.md` 或 `<domain>-<feature>-cases.md`

## 模板

复制 `_template.md`。
