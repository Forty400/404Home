# SPDD 工作流

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
spdd-generate          → 按画布改代码（404home/...）
    │
    ▼
人工 Review / 联调
    │
    ▼
spdd-sync              → 回写画布，消除漂移
    │
    ▼
沉淀 RAG               → docs/spdd/rag/knowledge/ + index.md
```

## 何时用哪一层

| 资产 | 放什么 | 何时读 |
| --- | --- | --- |
| Rule | 不可违反的约定（栈、目录、安全） | 自动注入 |
| Skill | 固定步骤的工作流 | 用户点名或触发词 |
| Canvas | 某次变更的设计契约 | 实现该功能时 |
| RAG | 长期事实、决策、运维笔记 | 缺上下文时检索 |

## 命名约定

- 分析：`docs/spdd/analysis/YYYYMMDD-<slug>.md`
- 画布：`docs/spdd/canvases/YYYYMMDD-<slug>.md`
- 知识块：`docs/spdd/rag/knowledge/<domain>-<topic>.md`
