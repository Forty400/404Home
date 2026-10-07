# Analysis · 详情页同分类相关工具

- Date: 2026-10-06
- Author: SPDD cycle
- Status: ready
- Related canvas: `docs/spdd/canvases/20261006-related-tools.md`

## 1. Problem

详情页看完后只能回首页或分类列表，缺少「同场景还有哪些工具」的引导，跳转路径偏长。

## 2. Goals / Non-goals

**Goals**

- 在工具详情页展示同分类其他工具（最多 6 条）。
- 点击相关卡片进入对应详情；可链到完整分类页。
- 无同类或仅自己一条时不展示空块。

**Non-goals**

- 不做协同过滤 / 标签相似度算法。
- 不改数据库 schema，不新增后端接口（复用 `GET /api/tools?category=`）。
- 不做「猜你喜欢」跨分类推荐。

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| 访客 | 看 ChatGPT 详情 | 看到同属聊天助手的其他工具 |
| 访客 | 分类里只有这一条 | 不出现「相关工具」区块 |
| 访客 | 点相关卡片 | 进入该工具详情 |

## 4. Constraints

- Tech: 现有 tools 列表 API + Vue 详情页。
- UI: 复用 `ToolCard` 与 `tool-grid`。

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 包含当前工具 | 重复推荐 | 按 slug 过滤 |
| 循环点击加载 | 体验差 | watch slug 重新拉列表 |

## 6. Open Questions

- [x] 条数？→ 6

## 7. Recommended Next

→ `docs/spdd/canvases/20261006-related-tools.md`
