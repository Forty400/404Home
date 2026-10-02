---
name: spdd-generate
description: >-
  Implements code strictly from an active REASONS Canvas. Use when the
  user says spdd-generate, 按画布实现, 按契约开发, or generate from SPDD.
---

# SPDD Generate

## Steps

1. Identify the canvas path (user-provided or latest matching topic under `docs/spdd/canvases/`).
2. Read the full canvas. Follow **Operations** order.
3. Obey **Norms** and never violate **Safeguards**.
4. Touch only files listed in Structure unless a blocker requires a minimal extra change (document it).
5. After implementation, summarize: ops completed, leftovers, suggested `spdd-sync` if drift.

## Rules

- Canvas is the contract. If requirements conflict with existing code, stop and ask or update canvas first.
- No drive-by refactors outside Operations.
