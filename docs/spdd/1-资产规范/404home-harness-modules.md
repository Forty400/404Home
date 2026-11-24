# 规范 · Harness 模块地图（功能分块 SoT）

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-specs-by-module.md`；`ADR-20261012-backfill-tests-by-module.md`
- Related analysis: `docs/spdd/analysis/20261125-harness-module-requirements.md`
- Related tests: 各模块见 `3-测试边界/` · `4-测试条例/`（按 ID 对照下表）
- Updated: 2026-11-25
- Source confidence: high（对照当前代码路由/页面 + 磁盘 SPDD 资产）

## 1. Scope

定义 404Home **harness 模块**（可独立审查/验收的功能切片）及与四层资产、代码锚点的映射。  
用于：SPDD 完整性审查、开画布前定范围、避免跨模块漏改。  
不含单次变更步骤（见 canvases Operations）。

## 2. Rules

1. 新功能先挂到下表某一 H-ID；跨两块以上必须在 ADR/画布写清主模块与从属。
2. 模块文件命名仍用 `404home-<topic>.md`；H-ID 只做索引，不改历史文件名。
3. 「完整」= 1+3+4 齐或明确声明某层不适用（如 H18 无自动化条例）；「缺口」须在 analysis 跟踪。
4. 作品集双主角固定：**H08** Trial 计费/SSE、**H13** 工具 RAG+MCP；CMS 为宿主（H02）。
5. 索引漂移（磁盘有文件但 README 未列）视为卫生缺陷，发现即改 README，不另开产品画布。

## 3. Module map

| ID | 名称 | 1 规范 | 3 边界 | 4 条例 | 主画布 / ADR | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| H01 | 架构基线 | [404home-architecture.md](./404home-architecture.md) | ✓ | ✓ | portfolio-freeze / arch-slim | 跨切约束 |
| H02 | CMS 宿主 | （暂挂 architecture） | ✗ | ✗ | 散落 hot-articles / UX | **缺口**：建议回填 |
| H03 | 工具详情 | [404home-tool-detail.md](./404home-tool-detail.md) | ✓ | ✓ | 20261002-tool-detail | |
| H04 | 相关推荐 | [404home-related-tools.md](./404home-related-tools.md) | ✓ | ✓ | 20261006-related-tools | |
| H05 | 主题色 | [404home-theme.md](./404home-theme.md) | ✓ | ✓ | 20261008-theme-colors | |
| H06 | C 端认证 | [404home-auth.md](./404home-auth.md) | ✓ | ✓ | user-auth-web-p0 | |
| H07 | 钱包 / VIP | [404home-wallet.md](./404home-wallet.md) | ✓ | ✓ | admin-wallet-p1 | RAG 可补 |
| H08 | Trial 对话+SSE | [404home-deepseek-chat.md](./404home-deepseek-chat.md) | ✓ | ✓ | trial-sse-llm-adapter | 作品集主角 |
| H09 | 试用纲领 | [404home-deepseek-trial.md](./404home-deepseek-trial.md) | ✓ | ✓ | deepseek-trial-roadmap | 产品级 |
| H10 | 后台会话审计 | [404home-admin-chats.md](./404home-admin-chats.md) | ✓ | ✓ | 20261008-admin-chats | |
| H11 | 全站客服 | [404home-customer-service.md](./404home-customer-service.md) | ✓ | ✓ | 20261024-customer-service | |
| H12 | 站内访问量 | [404home-site-analytics.md](./404home-site-analytics.md) | ✓ | ✓ | 20261024-site-analytics | |
| H13 | 工具 RAG+MCP | [404home-tool-rag-mcp.md](./404home-tool-rag-mcp.md) | ✓ | ✓ | 20261105-tool-rag-mcp | 第二主角 |
| H14 | 首页热门文章 | ✗ 待回填 | ✓ | ✓ | 20261021-hot-articles-home | 缺 1 |
| H15 | UX 系列 | ✗（可合并或不建） | ✓×多 | ✓×多 | ux-* canvases | 见分析 H15a–e |
| H16 | ICP 页脚 | ✗ 待回填 | ✓ | ✓ | 20261021-icp-compliance | 缺 1 |
| H17 | 作品集叙事 | ✗ | ✗ | ✗ | portfolio-ai-highlights HANDOFF | 文档型 |
| H18 | UAT | [404home-uat-guide.md](./404home-uat-guide.md) | — | — | RAG uat | 测指导 |

## 4. Code anchors（速查）

| ID | 路由 / 页面（代表） |
| --- | --- |
| H02 | `/admin/*` CRUD；`/` `category` `news` `tutorials` `search` |
| H03 | `/tool/:slug` |
| H06 | `/login` `/register`；`/api/user/*` |
| H08 | `/trial`；`/api/chat/completions` + `/stream` |
| H11 | CS 浮层；`/admin/cs` |
| H13 | `/smart-search`；`/api/smart-search`；MCP server |

## 5. Enforcement

- 开 `spdd-analysis` / canvas 时先查本表定 H-ID。
- 完整性审查底稿：`analysis/20261125-harness-module-requirements.md`。
- 违反：新功能无 H-ID 归属 → 先补地图行再实现。
