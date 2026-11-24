# 测试边界 · DeepSeek 试用产品纲领（E2E）

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`
- Related canvas: `docs/spdd/canvases/20261007-deepseek-trial-roadmap.md`
- Related 条例: `docs/spdd/4-测试条例/404home-deepseek-trial-cases.md`
- Related 规范: `docs/spdd/1-资产规范/404home-deepseek-trial.md`
- Updated: 2026-10-12

## 1. System under test

跨模块端到端路径：注册/登录 → Trial 聊天 → 余额变化；角色隔离；密钥边界。细节断言以子模块边界为准。

## 2. In scope

- 未登录不能调模型
- 邮箱登录后聊天余额下降（有 Key 环境）
- admin 与 C 端登录不可互换
- 移动浏览器基本可用（非小程序）
- 密钥仅服务端

## 3. Out of scope（刻意不测）

- 微信 OAuth/合并/30 日冷却（未落地前仅占位）
- 小程序、短信登录（明确不做）
- 备案与正式域名 HTTPS（D11 延期）
- 全量敏感词库

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| 跨阶段漂移 | 文档与码不一致 | E2E 抽样 + sync |
| 密钥进前端 | 资损 | P0 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| 子模块服务 | Real | 依赖 auth/wallet/chat |
| DeepSeek | Stub/Real | 同 chat 边界 |

## 6. Environments

- Local: 全栈
- CI: 待定（建议 Stub 上游）
- Forbidden: 生产池滥用压测
