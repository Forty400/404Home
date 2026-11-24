# ADR-20261012 · 按历史功能分模块回填测试边界与条例

- Status: accepted
- Date: 2026-10-12
- Deciders: user + AI
- Related canvas: `docs/spdd/canvases/20261012-spdd-asset-mgmt.md`
- Supersedes: —
- Superseded by: —
- Related: `ADR-20261012-backfill-specs-by-module.md` follow-up「按需回填测试」

## Context

规范层已按模块回填；仓库尚无自动化测试脚手架。用户要求继续回填，以闭合 SDD+TDD 的文档侧（边界 + 条例）。

## Decision

1. 按与规范相同的 **9 模块** 回填：
   - `3-测试边界/404home-*.md`
   - `4-测试条例/404home-*-cases.md`
2. 用例来源：历史画布 Acceptance criteria、Norms/Safeguards、已落规范 Rules；不编造未记载行为。
3. `Code tests` 字段标「待补」——本次**不**引入 vitest/jest/playwright 或写自动化代码。
4. 架构基线侧重跨模块冒烟与安全不变量；试用纲领侧重端到端验收意图，细节以子模块条例为准。

## Consequences

**Positive**

- TDD 有文档锚点，后续补自动化可按 TC 编号落地

**Negative / Trade-offs**

- 文档测试 ≠ 可执行测试；CI 仍无门禁直至脚手架落地

## Follow-ups

- [x] 写入边界 + 条例 + 两目录 README 索引
- [x] 规范 `Related tests` 回链
- [x] 选定测试栈并按 P0 条例补自动化 → `ADR-20261013-test-stack.md`（首批 auth）
