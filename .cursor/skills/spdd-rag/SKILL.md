---
name: spdd-rag
description: >-
  Looks up project AI knowledge via docs/spdd/rag index and knowledge
  files. Use when the user asks about project facts, 查知识库, RAG,
  404Home 架构/部署, or SPDD usage in this repo.
---

# SPDD RAG Lookup

## Steps

1. Read `docs/spdd/rag/index.md`.
2. Pick matching rows by tags/title; Read those `knowledge/*.md` files.
3. Answer with facts and cite paths like `docs/spdd/rag/knowledge/...`.
4. If nothing matches, say so; offer to add a new knowledge file + index row.

## Do not

- Invent deploy credentials; point to `404home/deploy.local.md` if private.
- Dump unrelated knowledge files into context.
