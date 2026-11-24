# ADR-20261012 · SPDD 四层资产 + SDD/TDD

- Status: accepted
- Date: 2026-10-12
- Deciders: user + AI
- Related canvas: `docs/spdd/canvases/20261012-spdd-asset-mgmt.md`
- Supersedes: —
- Superseded by: —

## Context

SPDD 已有 analysis / canvases / rag，但缺少跨变更的决策、规范与测试资产分层；开发方式需明确为 SDD 配合 TDD，并规定资产更新顺序。

## Decision

1. 在 `docs/spdd/` 下建立四层资产目录：
   - `1-资产规范`
   - `2-adr决策`
   - `3-测试边界`
   - `4-测试条例`
2. 保留 `analysis/`、`canvases/`、`rag/` 为过程与检索层；四层为稳定资产库。
3. 非琐碎开发默认 **SDD + TDD**。
4. 开发中及时更新资产，顺序固定为：**ADR → 测试边界与测试条例 → 资产规范 → 代码**（有决策时必须先 ADR）。

## Consequences

**Positive**

- 决策可审查、可追溯
- TDD 有文档锚点（边界 + 条例）
- AI/人协作有统一更新序

**Negative / Trade-offs**

- 小功能也需判断是否写 ADR（以「有取舍」为准）
- 初期资产可能偏少，需随功能逐步填充

## Follow-ups

- [x] 建目录与模板
- [x] 更新 workflow / Rule / Skills / RAG
- [x] 历史规范回填见 `ADR-20261012-backfill-specs-by-module.md`（仅规范层）
- [x] 历史测试边界/条例回填见 `ADR-20261012-backfill-tests-by-module.md`
- [ ] 后续功能按本 ADR 落资产；自动化测试脚手架待定
