---
name: spdd-generate
description: >-
  Implements code strictly from an active REASONS Canvas under SDD+TDD.
  Use when the user says spdd-generate, 按画布实现, 按契约开发, or generate from SPDD.
---

# SPDD Generate

## Steps

1. Identify the canvas path (user-provided or latest matching topic under `docs/spdd/canvases/`).
2. Read the full canvas. Follow **Operations** order.
3. **Asset gate（SDD + TDD）** — before writing production code:
   - If the change has architectural/product trade-offs: ensure `docs/spdd/2-adr决策/` has an accepted/proposed ADR; create/update it first if missing.
   - Ensure related `docs/spdd/3-测试边界/` and `docs/spdd/4-测试条例/` exist or are updated for this change.
   - If lasting conventions changed: update `docs/spdd/1-资产规范/` after tests assets (not before ADR).
4. Obey **Norms** and never violate **Safeguards**.
5. **TDD gate**: Read `.cursor/skills/test-driven-development/SKILL.md`, then align automated tests with `4-测试条例` — failing test first, watch it fail, minimal code to green, refactor. Skip Superpowers `brainstorming` / `writing-plans` when this canvas is the contract.
6. Keep diffs lean (Ponytail): no drive-by features; do not drop trust-boundary validation or required tests.
7. Touch only files listed in Structure unless a blocker requires a minimal extra change (document it).
8. After implementation, summarize: ops completed, asset files touched, leftovers, suggested `spdd-sync` if drift.

## Rules

- Canvas is the contract. If requirements conflict with existing code, stop and ask or update canvas first.
- Asset update order: **ADR → 测试边界/条例 → 资产规范 → code**.
- No drive-by refactors outside Operations.
