# 2 · ADR 决策

Architecture Decision Records：记录**有取舍**的架构/产品/流程决策、背景、后果与状态。

## 何时写（优先）

开发中出现以下任一情况时，**先写或先改 ADR，再动测试与规范**：

- 选型、分层、数据模型、鉴权、第三方依赖
- 明确否决某方案
- 改变既有 ADR 的结论（新开 ADR 并标记旧条 deprecated/superseded）

琐碎文案/样式微调可无 ADR。

## 更新顺序中的位置

**ADR（最先）** → `测试边界` + `测试条例` → `资产规范` → 代码

## 命名

`ADR-YYYYMMDD-<slug>.md`

## 模板

复制 `_template.md`。本目录首条元决策见 `ADR-20261012-spdd-asset-layers.md`。
