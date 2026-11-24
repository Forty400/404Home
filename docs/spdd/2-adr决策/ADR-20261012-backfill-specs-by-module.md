# ADR-20261012 · 按历史功能分模块回填资产规范

- Status: accepted
- Date: 2026-10-12
- Deciders: user + AI
- Related canvas: `docs/spdd/canvases/20261012-spdd-asset-mgmt.md`
- Supersedes: `ADR-20261012-spdd-asset-layers.md` 中「不批量回填历史」follow-up
- Superseded by: —

## Context

四层资产目录已建立，但历史画布/RAG 中的稳定约定仍只在过程文档与 knowledge 中。用户要求**根据历史功能分模块回填规范**，以便后续 SDD 有可复用约束。

## Decision

1. **本次只回填 `1-资产规范/`**（按模块拆分）；`3-测试边界` / `4-测试条例` 不在本 ADR 范围，后续功能或专项再补。
2. 模块划分与文件命名：

| 模块 | 规范文件 |
| --- | --- |
| 架构基线 | `404home-architecture.md` |
| 工具详情 | `404home-tool-detail.md` |
| 相关推荐 | `404home-related-tools.md` |
| 主题色 | `404home-theme.md` |
| C 端认证 | `404home-auth.md` |
| 钱包 / VIP / 后台充值 | `404home-wallet.md` |
| DeepSeek 对话计费 | `404home-deepseek-chat.md` |
| 后台会话审计 | `404home-admin-chats.md` |
| 试用产品纲领 | `404home-deepseek-trial.md` |

3. 内容来源：对应 `canvases/`、`analysis/`、`rag/knowledge/` 的 Norms / Safeguards / AC；**不编造未记载规则**。
4. 已知冲突以较新画布为准：
   - UI「纸感浅绿」→ 被主题画布覆盖为蓝白亮色 + slate 暗色
   - 主题存储键 → `404home-theme-pref`
   - 域名/HTTPS → D11：先 IP，备案后再 HTTPS
5. RAG knowledge 保留检索摘要，并链到对应规范原文。

## Consequences

**Positive**

- 实现与 review 有分模块 SoT
- 与现有画布/RAG 可互相追溯

**Negative / Trade-offs**

- 部分画布 AC 未勾选但 Sync 称已实现 → 规范标注 `source_confidence`，不以未勾选 AC 否定已落地行为
- 测试资产仍空，TDD 闭环未因本次回填补齐

## Follow-ups

- [x] 写入上表各规范文件 + `1-资产规范/README` 索引
- [x] 更新 RAG 指向规范
- [x] 按需回填测试边界/条例 → `ADR-20261012-backfill-tests-by-module.md`
