# AI 开发资产 · SPDD

本目录用 **SPDD（Structured-Prompt-Driven Development，结构化提示驱动开发）** 管理 AI 协作资产，并以 **SDD + TDD** 作为默认开发方式。

参考：[OpenSPDD](https://github.com/gszhangwei/open-spdd) · [Martin Fowler · SPDD](https://www.martinfowler.com/articles/structured-prompt-driven/)

## 原则

1. **提示是一等资产**：可版本化、可审查，不是一次性聊天。
2. **REASONS Canvas = 单次变更设计契约**：先契约，再生成代码。
3. **四层稳定资产**及时更新；有取舍时 **先 ADR，再测试，再规范**。
4. **SDD + TDD**：规范/画布驱动实现；测试边界与条例先于（或伴随）实现落地。
5. **现实偏离时先改契约/资产，再改代码**（`spdd-sync`）。
6. **分层分工**：
   - **Rule**：稳定硬约束（始终或按文件生效）
   - **Skill**：可复用工作流（分析 / 画布 / 生成 / 同步）
   - **四层资产**：规范 · ADR · 测试边界 · 测试条例
   - **RAG 知识库**：按需检索的项目事实摘要

## 目录

```text
docs/spdd/
├── README.md                 # 本说明
├── workflow.md               # 推荐工作流（含资产更新序）
├── 1-资产规范/               # 跨功能稳定约定
├── 2-adr决策/                # ADR（开发时最先更新）
├── 3-测试边界/               # TDD：测什么 / 不测什么
├── 4-测试条例/               # TDD：用例级验收意图
├── templates/                # 分析 / 画布模板
├── analysis/                 # 填写后的分析文档
├── canvases/                 # 填写后的 REASONS 画布
└── rag/
    ├── README.md
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

## 资产更新顺序（开发中）

```text
有架构/产品取舍？
    │ 是
    ▼
2-adr决策          ← 先动
    │
    ▼
3-测试边界 + 4-测试条例
    │
    ▼
1-资产规范         ← 决策需沉淀为长期约束时
    │
    ▼
按画布实现代码（SDD）+ 按条例写/改测试（TDD）
```

## 快速开始

1. 写需求或口述功能 → `spdd-analysis`（复杂时）→ `spdd-reasons-canvas`。
2. 有决策：在 `2-adr决策/` 落 ADR；再写/改 `3-测试边界/` 与 `4-测试条例/`；需要则更新 `1-资产规范/`。
3. `spdd-generate`：按画布改代码，按条例落实测试。
4. 行为变化：`spdd-sync` 回写画布与相关四层资产。
5. 稳定事实摘要写入 `rag/knowledge/`，并更新 `rag/index.md`。

## 当前产品锚点

- 项目：`404home`（Vue 3 + Koa + SQLite AI 工具导航）
- 部署备忘：`404home/deploy.local.md`（本地私密，已 gitignore）
- 元 ADR：`2-adr决策/ADR-20261012-spdd-asset-layers.md`
- **Harness 模块地图（H01–H18）**：`1-资产规范/404home-harness-modules.md` ← 审查底稿 `analysis/20261125-harness-module-requirements.md`
- **进行中 · 工具 RAG + MCP**：`canvases/20261105-tool-rag-mcp-HANDOFF.md`（给外部 AI 粘贴）← `canvases/20261105-tool-rag-mcp.md` + `ADR-20261105-tool-rag-mcp.md`
