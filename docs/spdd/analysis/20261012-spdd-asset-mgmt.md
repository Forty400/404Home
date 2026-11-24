# Analysis · SPDD 资产管理（四层资产 + SDD/TDD）

- Date: 2026-10-12
- Author: AI + user
- Status: ready
- Related canvas: `docs/spdd/canvases/20261012-spdd-asset-mgmt.md`

## 1. Problem

现有 SPDD 侧重「分析 → 画布 → 生成 → 同步 → RAG」，缺少可版本化的**决策 / 规范 / 测试**资产分层。开发中决策易散落在聊天或画布里，测试边界与条例不显式，难以配合 SDD + TDD。

## 2. Goals / Non-goals

**Goals**

- 在 `docs/spdd/` 下建立四层资产目录：`1-资产规范`、`2-adr决策`、`3-测试边界`、`4-测试条例`。
- 约定开发时**及时更新资产**；更新顺序：**先 ADR → 再测试（边界+条例）→ 再规范**。
- 全体功能开发默认采用 **SDD（契约/规范驱动）+ TDD（测试先于或伴随实现）**。
- Rule / Skill / workflow / RAG 同步反映该约定。

**Non-goals**

- 不迁移历史画布内容到四层资产（按需逐步沉淀）。
- 不引入新测试框架或改 404home 业务代码。
- 不废除 `analysis/`、`canvases/`、`rag/`（仍为过程与检索层）。

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| 开发者 / AI | 做功能变更 | 先 ADR（有决策时），再写测试边界/条例，再更新规范，再按画布写代码 |
| Reviewer | 审查变更 | 能从四层资产核对决策、边界与验收条例 |
| 后续会话 | 缺上下文 | 经 RAG / 目录可读到稳定决策与规范 |

## 4. Constraints

- Tech: Markdown 资产；Cursor Rule/Skill 注入流程
- Time: 本次只建结构与流程，不批量回填历史
- Ops / security: 不写入密钥；部署私密仍走 `deploy.local.md`

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 四层与画布职责重叠 | 重复维护 | 画布=单次变更契约；四层=跨变更稳定资产 |
| 不写 ADR 直接改码 | 决策丢失 | Rule 强制有架构取舍时先写 ADR |
| 测试资产空转 | TDD 名存实亡 | Generate 步骤要求先有边界/条例再写实现 |

## 6. Open Questions

- [x] 目录名用中文编号：`1-资产规范` … `4-测试条例`（按用户指定）
- [x] 与 RAG：稳定 ADR/规范可摘要进 `rag/knowledge/`，原文留在四层目录

## 7. Recommended Next

→ 生成 REASONS Canvas：`docs/spdd/canvases/20261012-spdd-asset-mgmt.md`
