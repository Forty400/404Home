---
title: SPDD 在本仓库的用法
tags: [spdd, process, cursor, sdd, tdd, adr, superpowers, ponytail]
updated: 2026-10-21
---

# SPDD 在本仓库的用法

## 闭环

`analysis` → `reasons-canvas` → **四层资产（ADR → 测试 → 规范）** → `generate`（SDD+TDD）→ review → `sync` → 沉淀 RAG

## 开发方式

- **SDD**：以 REASONS 画布 + 资产规范为契约再写代码
- **TDD**：先（或同步）落 `3-测试边界` 与 `4-测试条例`，再实现；自动化测试对齐条例；实现时必读入仓 `.cursor/skills/test-driven-development/`（Superpowers）
- **Ponytail**：`.cursor/rules/ponytail.mdc` always-on，最少必要代码（不砍校验/安全/条例测试）
- **定序**：有活跃 SPDD 画布时不启用 Superpowers `brainstorming` / `writing-plans`。ADR：`docs/spdd/2-adr决策/ADR-20261021-spdd-superpowers-ponytail.md`；版本 SHA：`THIRD_PARTY_NOTICES.md`

## 四层资产

| 目录 | 职责 |
| --- | --- |
| `docs/spdd/1-资产规范/` | 跨功能稳定约定（404Home 已按模块回填，见该目录 README） |
| `docs/spdd/2-adr决策/` | 有取舍的决策（开发中最先更新） |
| `docs/spdd/3-测试边界/` | 测什么 / 不测什么（404Home 九模块已回填） |
| `docs/spdd/4-测试条例/` | 用例级验收意图（`*-cases.md`）；auth 首批自动化见 `404home` 的 `npm test` |

元 ADR：`docs/spdd/2-adr决策/ADR-20261012-spdd-asset-layers.md`

## 触发

- Cursor Skills：`.cursor/skills/spdd-*`
- 可选 Commands：`.cursor/commands/spdd-*.md`
- 规则：`.cursor/rules/spdd-core.mdc`（始终提醒走契约与资产序）

## 产物位置

- 分析：`docs/spdd/analysis/`
- 画布：`docs/spdd/canvases/`
- 模板：`docs/spdd/templates/`（分析/画布）；各资产目录下 `_template.md`
- 稳定资产：`1-资产规范` … `4-测试条例`
