---
name: spdd-sync
description: >-
  Syncs REASONS Canvas and SPDD asset layers with code after review or
  manual changes. Use when the user says spdd-sync, 同步画布, 设计漂移,
  or update SPDD after coding.
---

# SPDD Sync

## Steps

1. Read the target canvas under `docs/spdd/canvases/`.
2. Diff reality (code + behavior + tests) against Requirements / Operations / Safeguards.
3. Classify drift:
   - `canvas_update_needed` — intentional code change → update canvas
   - `code_fix_needed` — accidental drift → fix code to match canvas
   - `asset_update_needed` — decision/tests/norms drifted → update四层资产
   - `norm_violation` — call out and fix
4. Apply the agreed direction. When updating assets, order is: **ADR → 测试边界/条例 → 资产规范**.
5. Append a row to the canvas **Sync log**.
6. If the outcome is a lasting fact, add/update `docs/spdd/rag/knowledge/` and `index.md`.

## Principle

When reality diverges, **decide deliberately**: fix prompt/canvas/assets first or fix code — do not leave silent drift.
