# AI 指导文档 · 工具智能检索（RAG + MCP）

本目录是给 **外部 AI 写代码** 用的自包含指导包，对应在 404Home 上落地：

- 工具实体切分 + 向量化  
- 双路各 20 → RRF → LLM 精排 top-5 + 命中理由  
- Recall@5 评测脚本  
- MCP Server 三工具接入 Cursor  

代码根目录即本仓库上级：`E:\AAAproject\AI_SPACE\404home`。

## 怎么用

1. **优先**打开并整份粘贴：[`00-HANDOFF-给外部AI粘贴.md`](./00-HANDOFF-给外部AI粘贴.md)  
2. 需要更细设计时再附：`01` 画布、`02` ADR、`06` 测试条例  
3. 实现时按 HANDOFF §6 顺序；先写 `server/test/smart-search-p0.test.js`，再写实现  

## 文件清单

| 文件 | 用途 |
| --- | --- |
| `00-HANDOFF-给外部AI粘贴.md` | **主交付物**：粘贴给另一 AI 的实现说明书 |
| `01-REASONS画布.md` | SPDD 设计契约（R/E/A/S/O/N/S） |
| `02-ADR.md` | 作品集局部解冻决策 |
| `03-分析.md` | 问题 / 目标 / 风险 |
| `04-资产规范.md` | 长期硬规则 |
| `05-测试边界.md` | 测什么 / 不测什么 |
| `06-测试条例.md` | TC-01～10 Given/When/Then |

## 与 `docs/spdd` 的关系

同内容亦已写入 `E:\AAAproject\AI_SPACE\docs\spdd\`（仓库级 SPDD 资产）。  
**以本目录为给外部 AI 的入口**；若两边漂移，优先改本目录后再同步回 `docs/spdd`。
