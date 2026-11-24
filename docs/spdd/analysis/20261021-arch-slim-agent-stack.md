# Analysis · 架构精简 + Superpowers/Ponytail 入仓

- Date: 2026-10-21
- Author: user + AI
- Status: ready
- Related canvas: `docs/spdd/canvases/20261021-arch-slim-agent-stack.md`

## 1. Problem

作品集窗口内需在现有 Vue/Koa/SQLite 栈上提升架构可验证性与协作效率：架构条例 P0（双角色 JWT 等）标注「待补」自动化；Agent 协作缺入仓的红绿 TDD 与精简产出约束，易出现双流程或过度实现。

## 2. Goals / Non-goals

**Goals**

- 将 Ponytail、Superpowers skills/rules 入仓并与 SPDD 定序
- 补齐 architecture TC-01–03（及 TC-04）自动化
- Trial 视图最小模块化（抽出 composable），不改计费语义

**Non-goals**

- Vite / 微前端 / 全仓 TS
- 新依赖、目录大搬家、香港机运维
- 用 Superpowers brainstorm/writing-plans 替代 SPDD

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| 开发者 / Agent | 按画布实现 | 先红后绿；diff 精简；资产序不被跳过 |
| 审查者 | 看架构不变量 | `architecture-p0` 测试可跑 |

## 4. Constraints

- Tech: 遵守 `ADR-20261015-portfolio-freeze`
- Time: 单窗口交付工具入仓 + P0 测试 + Trial 瘦身
- Ops / security: 密钥不进仓；不砍信任边界校验

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Superpowers 与 SPDD 双流程 | 资产漂移 | ADR：有画布则禁用 brainstorm/writing-plans |
| Trial 拆分行为漂移 | 试用坏 | 先 chat/architecture 测试绿再抽；禁止改计费 |
| 入仓技能体积 | 仓大 | pinned commit + THIRD_PARTY_NOTICES |

## 6. Open Questions

- [x] 工具入仓方式：project rules/skills（非 marketplace）
- [x] 应用层范围：架构 P0 测试 + Trial composable

## 7. Recommended Next

→ 生成 REASONS Canvas：`docs/spdd/canvases/20261021-arch-slim-agent-stack.md`
