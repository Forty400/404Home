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
6. Do **not** implement code here unless the user explicitly asks to generate next.

## Quality bar

- Norms = how to write; Safeguards = what must not happen.
- Avoid vague ops like “implement login”; specify files and behavior.
