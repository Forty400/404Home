---
name: spdd-sync
description: >-
  Syncs REASONS Canvas with code after review or manual changes. Use when
  the user says spdd-sync, 同步画布, 设计漂移, or update SPDD after coding.
---

# SPDD Sync

## Steps

1. Read the target canvas under `docs/spdd/canvases/`.
2. Diff reality (code + behavior) against Requirements / Operations / Safeguards.
3. Classify drift:
   - `canvas_update_needed` — intentional code change → update canvas
   - `code_fix_needed` — accidental drift → fix code to match canvas
   - `norm_violation` — call out and fix
4. Apply the agreed direction; append a row to the canvas **Sync log**.
5. If the outcome is a lasting fact, add/update `docs/spdd/rag/knowledge/` and `index.md`.

## Principle

When reality diverges, **decide deliberately**: fix prompt/canvas first or fix code — do not leave silent drift.
