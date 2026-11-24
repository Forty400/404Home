# Third-party notices (agent skills)

Vendored Cursor skills/rules for AI collaboration. Not runtime application dependencies.

## Ponytail

- Source: https://github.com/DietrichGebert/ponytail
- Version: 5.3.2
- Pinned commit: `09c434ab73ca43761c5d8b0c5d341926c2fba710`
- License: MIT
- Paths: `.cursor/rules/ponytail.mdc`, `.cursor/skills/ponytail*`

## Superpowers

- Source: https://github.com/obra/superpowers
- Version: 7.0.0
- Pinned commit: `bb92a77741419a4ab5f06e711a283343f1ada0c3`
- License: MIT
- Paths: `.cursor/skills/` entries listed in that repo's `skills/` (excluding `spdd-*` which are first-party)

## Anthropic Skills (web design)

- Source: https://github.com/anthropics/skills
- Pinned commit: `dbd4588f9e1033efb41dad4bef2f7947c8993d44`
- License: Apache-2.0 (`.cursor/skills/frontend-design/LICENSE.txt`)
- Paths: `.cursor/skills/frontend-design/`

## The Design Project (web design)

- Source: https://github.com/thedesignproject/agent-skills
- Pinned commit: `11a86581811b80f1f2d1c1198acebec69a59b4d4`
- License: MIT
- Paths:
  - `.cursor/skills/web-design-guidelines/`
  - `.cursor/skills/ux-audit/`
  - `.cursor/skills/accessibility/`
  - `.cursor/skills/extract-design-system/`

## Refresh

```bash
# Download upstream zips, copy rules/skills as in ADR-20261021, update this file's commit SHAs.
# Web design subset:
#   npx skills add anthropics/skills --skill frontend-design -a cursor
#   npx skills add thedesignproject/agent-skills -s web-design-guidelines -s ux-audit -s accessibility -s extract-design-system -a cursor
```
