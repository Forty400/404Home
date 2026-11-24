---
name: spdd-reasons-canvas
description: >-
  Creates or updates a REASONS Canvas design contract under
  docs/spdd/canvases/. Use when the user says spdd-reasons-canvas,
  REASONS, SPDD 画布, 设计契约, or structured prompt for implementation.
---

# SPDD REASONS Canvas

## Steps

1. Read `docs/spdd/templates/reasons-canvas.md`.
2. If an analysis exists, Read it; else ask for goal/scope in brief.
3. Inspect only the code paths you will name under Structure/Operations.
4. Write `docs/spdd/canvases/YYYYMMDD-<slug>.md` with all seven sections:
   Requirements, Entities, Approach, Structure, Operations, Norms, Safeguards.
5. Operations must be ordered, file-specific, and have “Done when” checks.
6. In Structure/Operations, name related asset paths when applicable:
   - `docs/spdd/2-adr决策/...`（有取舍时）
   - `docs/spdd/3-测试边界/...`、`docs/spdd/4-测试条例/...`
   - `docs/spdd/1-资产规范/...`（需沉淀规范时）
7. Remind: generate 阶段资产更新序为 ADR → 测试 → 规范 → 代码（SDD+TDD）。
8. Do **not** implement code here unless the user explicitly asks to generate next.

## Quality bar

- Norms = how to write; Safeguards = what must not happen.
- Avoid vague ops like “implement login”; specify files and behavior.
