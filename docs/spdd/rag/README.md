# RAG 知识库

用 Markdown 知识块给 Agent **按需补事实**。不是把整仓塞进上下文，而是：查 `index.md` → 读相关 `knowledge/*.md`。

## 写入规范

1. **一个主题一个文件**，文件名：`<domain>-<topic>.md`
2. 文首用 frontmatter 标标签，便于检索：
   ```yaml
   ---
   title: 简短标题
   tags: [404home, deploy, api]
   updated: 2026-10-02
   ---
   ```
3. 正文写**可验证事实**（路径、命令、约定、决策），少写空话。
4. 新增/变更后更新 [index.md](index.md)。

## 与 Rule / Skill / Canvas 的边界

| 类型 | 适合 RAG？ |
| --- | --- |
| 长期事实、运维、产品决策 | 是 |
| 必须永远遵守的硬约束 | 否 → Rule |
| 固定工作流步骤 | 否 → Skill |
| 某次功能的设计契约 | 否 → Canvas（可事后摘要进 RAG） |

## 检索方式（当前阶段）

未接向量库前，采用 **索引 + 人工/Agent 读文件**：

1. 打开 `index.md` 按标签找文件  
2. `Read` 对应 `knowledge/*.md`  
3. 回答时引用文件路径  

后续可再接本地向量库 / Cursor 索引，而不改知识文件格式。
