# AI 开发资产 · SPDD

本目录用 **SPDD（Structured-Prompt-Driven Development，结构化提示驱动开发）** 管理 AI 协作资产：设计契约、Rule、Skill、RAG 知识库。

参考：[OpenSPDD](https://github.com/gszhangwei/open-spdd) · [Martin Fowler · SPDD](https://www.martinfowler.com/articles/structured-prompt-driven/)

## 原则

1. **提示是一等资产**：可版本化、可审查，不是一次性聊天。
2. **REASONS Canvas = 设计契约**：先契约，再生成代码。
3. **现实偏离时先改契约，再改代码**（`spdd-sync`）。
4. **分层分工**：
   - **Rule**：稳定硬约束（始终或按文件生效）
   - **Skill**：可复用工作流（分析 / 画布 / 生成 / 同步）
   - **RAG 知识库**：按需检索的项目事实与决策记录

## 目录

```text
docs/spdd/
├── README.md                 # 本说明
├── workflow.md               # 推荐工作流
├── templates/
│   ├── analysis.md           # 需求分析模板
│   └── reasons-canvas.md     # REASONS 七维画布模板
├── analysis/                 # 填写后的分析文档
├── canvases/                 # 填写后的 REASONS 画布
└── rag/
    ├── README.md             # RAG 用法
    ├── index.md              # 知识索引（检索入口）
    └── knowledge/            # 可检索的 Markdown 知识块
```

Cursor 侧：

```text
.cursor/
├── rules/                    # 持久规则
├── skills/                   # SPDD Skills
└── commands/                 # 斜杠命令入口（可选）
```

## 快速开始

1. 写需求或口述功能。
2. 调用 Skill / 命令：`spdd-analysis` → `spdd-reasons-canvas` → `spdd-generate`。
3. 实现后若改了行为：`spdd-sync` 回写画布。
4. 稳定事实写入 `rag/knowledge/`，并更新 `rag/index.md`。

## 当前产品锚点

- 项目：`404home`（Vue 3 + Koa + SQLite AI 工具导航）
- 部署备忘：`404home/deploy.local.md`（本地私密，已 gitignore）
