# Analysis · Harness 模块需求分块（仓库功能完整性审查底稿）

- Date: 2026-11-25
- Author: AI（应要求：按 harness 分块入库，供人工审查 SPDD 功能完整度）
- Status: ready
- Related canvas: （审查后按缺口开画布；本文件不直接生成代码）
- Related map: `docs/spdd/1-资产规范/404home-harness-modules.md`

## 1. Problem

404Home 功能已跨 CMS、试用计费、RAG/MCP、客服、分析等多域；SPDD 四层资产按历史回填，**模块边界与索引不完全对齐代码面**。若不先做 harness 级需求分块，审查时容易漏掉「有代码无规范」或「有条例无规范/无索引」的空洞，无法判断作品集主链路是否功能完整。

## 2. Goals / Non-goals

**Goals**

- 把仓库**可演示/可验收**能力切成稳定 harness 模块（H01–H18），每块给出：业务意图、代码锚点、SPDD 资产链路、验收要点、完整度评级。
- 产出一份可供人工「简单审查」的完整度矩阵与优先补洞清单。
- 将模块地图沉淀为长期规范 `1-资产规范/404home-harness-modules.md`，并修正 README 索引漂移。

**Non-goals**

- 本批不写生产代码、不新开实现画布、不回填全部缺失规范正文。
- 不引入新测试框架；不重写历史画布 AC。

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| 你（审查） | 对照 H 模块扫 SPDD + 站点 | 10–20min 内能说出「全 / 缺规范 / 缺测试 / 缺代码」 |
| 后续实现 AI | 按缺口开 analysis→canvas | 范围不漂到相邻模块 |
| 面试官 | 追作品集两主角 | Trial 计费 + 智能检索可指到 H07/H08/H13 |

## 4. Constraints

- Tech: 仍遵循 `404home-architecture`（Vue3 + Koa + SQLite；金额用分；双 JWT）。
- Time: 本批只做分块与审查底稿。
- Ops / security: 密钥仍仅 server env；审查文档不粘贴密钥。

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 模块切太碎 | 审查成本高 | 18 块封顶；UX 系列合并为 H15 |
| 与历史九模块命名不一致 | 检索混乱 | 地图表保留旧文件名对照 |
| 把「未勾选 AC」当未实现 | 误判完整度 | 以代码 + Sync/规范 `source_confidence` 为准 |

## 6. Open Questions

- [ ] CMS 宿主（H02）是否单独回填 `1/3/4`，还是长期挂在 architecture？
- [ ] About/作品集叙事（H17）是否只需 HANDOFF，不建测试资产？
- [ ] `4-测试条例/README`「Code tests 均为待补」与仓库已有 `npm test` 冲突——是否改为「部分已绿、条例需对齐代码用例名」？

## 7. Recommended Next

→ 人工审查本文件 §8–§10 后：对标红模块开 REASONS Canvas（建议优先 `20261125-cms-host-spec` 或 `20261125-spdd-index-sync`）。  
→ 规范地图：`docs/spdd/1-资产规范/404home-harness-modules.md`

---

## 8. Harness 模块分块（需求 + 锚点 + 验收）

完整度图例：`●` 有且可对照 · `◐` 部分/散落 · `○` 缺失 · `—` 不适用

| ID | 模块 | 业务意图（一句话） | 代码锚点 | 1规范 | 3边界 | 4条例 | ADR/画布 | RAG | 评级 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H01 | 架构基线 | 栈、目录、双 JWT、金额分、作品集冻结 | `404home/` · architecture 规范 | ● | ● | ● | ● | ● | **完整** |
| H02 | CMS 宿主 | 分类/工具/文章后台 CRUD + 前台列表宿主 | `routes/{categories,tools,posts}.js` · `admin/{Tools,Categories,Posts}` · `Home/News/Tutorials/Category` | ◐ | ○ | ○ | ◐ | ◐ | **缺口大** |
| H03 | 工具详情 | 详情页字段与外链行为 | `ToolDetail.vue` · tools 详情 API | ● | ● | ● | ● | ● | **完整** |
| H04 | 相关推荐 | 详情页相关工具推荐 | related-tools 规范/画布 | ● | ● | ● | ● | ● | **完整** |
| H05 | 主题色 | 亮/暗/系统偏好 | theme 规范 · Header | ● | ● | ● | ● | ● | **完整** |
| H06 | C 端认证 | 注册/登录/验证码/me | `userAuth.js` · `user/Login|Register` | ● | ● | ● | ● | ● | **完整** |
| H07 | 钱包 / VIP | 账本、后台充值、余额不变量 | `wallet.js` · `admin/Users` | ● | ● | ● | ● | ○ | **基本完整** |
| H08 | Trial 对话计费 + SSE | 流式对话、适配层、按分扣费 | `chat.js` · `services/llm/` · `Trial.vue` · `useTrialChat` | ● | ● | ● | ● | ● | **完整**（SSE 合入 deepseek-chat） |
| H09 | 试用产品纲领 | `/trial` 产品叙事与 E2E 闭环 | Trial + roadmap | ● draft | ● | ● | ● | ◐ | **纲领可审** |
| H10 | 后台会话审计 | admin 看会话摘要/明细 | `admin/Chats` · chat admin API | ● | ● | ● | ● | ○ | **基本完整** |
| H11 | 全站客服 | FAQ 话术 + 转人工 + 工作台 | `cs.js` · `CsWorkbench` | ● | ● | ● | ● | ○ | **基本完整** |
| H12 | 站内访问量 | pageview + admin traffic | `analytics.js` · `stats.js` | ● | ● | ● | ● | ○ | **基本完整** |
| H13 | 工具 RAG + MCP | 智能检索、评测、MCP | `smartSearch.js` · `SmartSearch.vue` · MCP | ● | ● | ● | ● | ● | **完整但索引曾漏** |
| H14 | 首页热门文章 | `/` 热门 Feed | `Home.vue` · posts `is_hot` | ○ | ● | ● | ● | ◐ | **缺规范层** |
| H15 | UX 系列 | 加载信任、IA、闭环、Week B/C | 多 canvas/边界/条例 | ○ | ● | ● | ● | ○ | **缺统一规范** |
| H16 | ICP / 页脚合规 | 备案信息展示 | footer / icp 资产 | ○ | ● | ● | ● | ○ | **缺规范层** |
| H17 | 作品集叙事 | About / README 亮点可指文件 | `About.vue` · HANDOFF | ○ | ○ | ○ | ● | ○ | **轻量缺口** |
| H18 | UAT / 用户测 | 试用账号与测指导 | uat-guide · RAG uat | ● | — | — | ◐ | ● | **文档完整** |

### H01 · 架构基线

- **需求块**：技术栈锁定；CMS vs C 端增量边界；密钥不上前端；路由懒加载；Agent 协作走 SPDD+TDD+Ponytail。
- **验收**：改栈/JWT/金额单位必须先 ADR；`npm test` 架构 P0 可跑。

### H02 · CMS 宿主（最大功能空洞）

- **需求块**：
  1. Admin JWT 登录与 `/admin` 路由守卫。
  2. Categories / Tools / Posts CRUD（含 slug、热门、封面、topic/source 等扩展字段）。
  3. 前台只读列表：分类页、资讯、教程、搜索（LIKE）、工具详情入口。
  4. **禁止**前端写死工具/文章列表。
- **现状**：有大量代码与部分字段 ADR，但**无独立 1/3/4**；约束散落在 architecture / hot-articles / UX。
- **验收（建议补）**：未登录写接口 401；列表来自 API；admin 改 `is_hot` 后首页可见。

### H03–H05 · 工具详情 / 相关推荐 / 主题

- 已回填完整；审查时抽查 AC 与页面是否仍一致即可。

### H06–H08 · 认证 / 钱包 / Trial（作品集主角）

- **需求块**：邮箱注册登录 → 余额分 → `/trial` SSE 流式 → 结束后扣费 ledger=`chat` → stub 可测。
- **验收**：TC 对齐 `deepseek-chat-cases` + trial E2E；无 Key / 余额 0 / 401 语义明确。

### H09 · 试用纲领

- 产品级故事与阶段性范围；实现细节以 H08 为准。审查时看 draft 是否与已落地 SSE 冲突。

### H10–H12 · 审计 / 客服 / 分析

- 资产齐全；RAG 可择要补摘要（非阻塞）。

### H13 · 工具 RAG + MCP（第二主角）

- **需求块**：索引重建、双路+RRF、LLM 精排 top-5、降级、评测 Recall@5、MCP 三工具、密钥仅 env。
- **注意**：文件已在 `1/3/4`，但 README 索引曾漏列 → 本批修正。

### H14–H16 · 宿主体验与合规

- 有边界+条例+画布，**缺 `1-资产规范` 稳定条文**；审查时决定是否回填或并入 architecture。

### H15 · UX 系列（合并 harness）

子块（审查勾选用）：

| 子 ID | 主题 | 边界/条例 |
| --- | --- | --- |
| H15a | 加载 / 时间戳信任 | `404home-ux-loading-trust*` |
| H15b | UX Week B/C | `404home-ux-week-bc*` |
| H15c | Sprint A 闭环 | `404home-ux-sprint-a-loops*` |
| H15d | Sprint B IA | `404home-ux-sprint-b-ia*` |
| H15e | SPDD 内容系列 | `404home-spdd-content*` |

### H17–H18 · 叙事与 UAT

- H17 靠 HANDOFF/About，无测试资产可接受（文档型）。
- H18 已有规范+RAG。

---

## 9. 与代码面的对照清单（防漏）

| 代码能力 | 归属 harness | SPDD 是否有独立契约 |
| --- | --- | --- |
| `GET/POST /api/categories*` | H02 | 否（仅 architecture） |
| `GET/POST /api/tools*`（含 grouped） | H02/H03 | 详情有；列表/CRUD 弱 |
| `GET/POST /api/posts*` | H02/H14 | 热门有 3/4；CMS CRUD 弱 |
| `POST /api/smart-search*` | H13 | 是 |
| `userAuth` + captcha | H06 | 是 |
| `auth` admin login | H02 | 弱 |
| `wallet` | H07 | 是 |
| `chat` + stream | H08 | 是（含 SSE） |
| `cs` | H11 | 是 |
| `analytics` + `stats` | H12 | 是 |
| `/search` LIKE UI | H02/H13 边界 | 弱（基线搜索） |
| `/smart-search` | H13 | 是 |
| `/about` | H17 | 画布/HANDOFF |
| `/trial` | H08/H09 | 是 |

---

## 10. 审查用完整度结论（给你勾选）

### 作品集主链路（建议优先看）

- [ ] H08 Trial SSE + 扣费：规范/条例/画布/RAG 齐，代码锚点清晰  
- [ ] H13 RAG+MCP：四层+RAG 齐；确认 README 已索引  
- [ ] H06+H07 认证与钱包：支撑 Trial 前置  

### 宿主与后台

- [ ] H02 CMS：是否接受「仅挂 architecture」？若否 → 回填规范+边界+条例  
- [ ] H14 热门文章：是否补 `1-资产规范/404home-hot-articles.md`  
- [ ] H10–H12：抽查 admin 页与 API 是否仍匹配条例  

### 体验与合规

- [ ] H15/H16：合并进 architecture 还是各自补规范  
- [ ] H17 About 亮点是否仍指向真实文件  

### 过程资产卫生

- [ ] 修正「Code tests 均为待补」与真实 `npm test` 漂移  
- [ ] 1/3/4 README 模块表与磁盘文件一致（含 tool-rag-mcp）  

### 建议补洞优先级（审查确认后执行）

1. **P0** 索引对齐（README + harness 地图）——本批已做  
2. **P0** H02 CMS 宿主最小规范+边界+2–3 条 P0 条例（若你判定「缺口大」不可接受）  
3. **P1** H14/H16 规范回填；H15 出一份 UX 总规范或明确「不入库 1」  
4. **P2** 钱包/客服/分析补 RAG 摘要；条例用例名对齐代码测试文件  

---

## 11. 本批已落盘动作

- 本分析：`docs/spdd/analysis/20261125-harness-module-requirements.md`
- 模块地图规范：`docs/spdd/1-资产规范/404home-harness-modules.md`
- 更新 `1/3/4` README 索引（补 tool-rag-mcp 等）
