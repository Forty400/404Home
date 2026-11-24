# SPDD 工作流

默认开发方式：**SDD（契约/规范驱动）+ TDD（边界与条例先行）**。

```text
需求 / 变更意图
    │
    ▼
spdd-analysis          → docs/spdd/analysis/<topic>.md
    │
    ▼
spdd-reasons-canvas    → docs/spdd/canvases/<topic>.md
    │
    ▼
更新四层资产（及时，按序）
    │  1) 2-adr决策/          ← 有取舍时必须先做
    │  2) 3-测试边界/ + 4-测试条例/
    │  3) 1-资产规范/         ← 需沉淀长期约束时
    │
    ▼
spdd-generate          → 按画布改代码 + 按条例落实测试
    │
    ▼
人工 Review / 联调
    │
    ▼
spdd-sync              → 回写画布与漂移的四层资产
    │
    ▼
沉淀 RAG               → docs/spdd/rag/knowledge/ + index.md
```

## 何时用哪一层

| 资产 | 放什么 | 何时读 / 写 |
| --- | --- | --- |
| Rule | 不可违反的约定（栈、目录、安全、资产序） | 自动注入 |
| Skill | 固定步骤的工作流 | 用户点名或触发词 |
| Canvas | 某次变更的设计契约 | 实现该功能时 |
| 2-adr决策 | 有取舍的决策与后果 | **开发中最先更新** |
| 3-测试边界 | 测什么 / 不测什么 | ADR 后、写测试前 |
| 4-测试条例 | 用例级 Given/When/Then | 与边界同批，实现前 |
| 1-资产规范 | 跨变更稳定约定 | 测试资产对齐后 |
| RAG | 长期事实摘要、运维笔记 | 缺上下文时检索 |

## 过程层 vs 资产层

| 层 | 目录 | 寿命 |
| --- | --- | --- |
| 过程 | `analysis/`、`canvases/` | 单次变更契约与分析 |
| 稳定资产 | `1-资产规范` … `4-测试条例` | 跨变更复用 |
| 检索 | `rag/` | 摘要索引，原文以资产/画布为准 |

## 命名约定

- 分析：`docs/spdd/analysis/YYYYMMDD-<slug>.md`
- 画布：`docs/spdd/canvases/YYYYMMDD-<slug>.md`
- ADR：`docs/spdd/2-adr决策/ADR-YYYYMMDD-<slug>.md`
- 边界 / 条例 / 规范：主题名或 `YYYYMMDD-<slug>.md`
- 知识块：`docs/spdd/rag/knowledge/<domain>-<topic>.md`
