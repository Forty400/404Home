# ADR-20261021 · SPDD + Superpowers + Ponytail 定序与入仓

- Status: accepted
- Date: 2026-10-21
- Deciders: user + AI
- Related canvas: `docs/spdd/canvases/20261021-arch-slim-agent-stack.md`
- Supersedes:
- Superseded by:

## Context

需要在作品集冻结范围内做架构精简与可验证性提升，并让 Agent 使用 Superpowers（红绿 TDD）与 Ponytail（精简产出）。两工具须**入仓**以便复现；与现有 SPDD 四层资产若无定序会双流程冲突。

## Decision

1. **入仓**：Ponytail → `.cursor/rules/ponytail.mdc` + `.cursor/skills/ponytail*`；Superpowers → `.cursor/skills/<skill>/`；版本与 SHA 记于 `THIRD_PARTY_NOTICES.md`。
2. **设计/契约**：只走 SPDD（analysis → canvas → ADR → 测试边界/条例 → 规范）。
3. **实现**：必读入仓 `test-driven-development`；`spdd-generate` 在 Asset gate 后执行红绿 TDD。
4. **精简**：Ponytail always-on；不砍信任边界校验与条例要求的测试。
5. **冲突**：有活跃 SPDD 画布时不启用 Superpowers `brainstorming` / `writing-plans`。
6. **本轮应用边界**：architecture P0 自动化 + Trial → `useTrialChat`；不做 Vite/大搬家。

## Consequences

**Positive**

- 协作可复现；架构不变量有自动化锚点；产出受精简约束

**Negative / Trade-offs**

- skills 体积增大；上游更新需手动刷新 NOTICE SHA
- Superpowers 设计类 skill 在有画布时被压制，需 Agent 遵守规则

## Follow-ups

- [x] 更新 `3-测试边界/404home-architecture.md`
- [x] 更新 `4-测试条例/404home-architecture-cases.md`
- [x] 更新 `1-资产规范/404home-architecture.md`
- [x] 摘要进 `rag/knowledge/spdd-usage.md`
