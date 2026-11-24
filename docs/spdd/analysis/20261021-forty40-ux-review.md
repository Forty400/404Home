# UX Review · forty40.online（404Home）

- Date: 2026-10-21
- Author: 真实用户路径走查（浏览器）
- Status: ready（供迭代优化，非实现契约）
- Site: https://forty40.online/
- Related product: `404home`
- Related canvas: `docs/spdd/canvases/20261021-ux-loading-trust.md`（Week A）· `docs/spdd/canvases/20261021-ux-week-bc.md`（Week B/C：UX-04～10）· `docs/spdd/canvases/20261021-ux-sprint-a-loops.md`（Sprint A：UX-21～24）
- Related ADR: `docs/spdd/2-adr决策/ADR-20261021-hot-articles-home.md` · `ADR-20261021-ux-week-bc.md` · `ADR-20261021-ux-sprint-a-loops.md`

## 0. 走查范围

| 路径 | 观察 |
| --- | --- |
| `/` | 文章 Feed + 分类条 + 搜索 + 热门工具 + 热榜 |
| `/search?q=PPT` | 有结果（如 AiPPT），信息偏薄 |
| `/category/writing` | 分类列表正常 |
| `/tool/chatgpt` | 先「加载中…」再出详情，内容偏薄 |
| `/trial` | 未登录即登录墙 |
| `/news/1` | 标题 + 摘要为主，正文厚度不足 |

**未测（迭代时补验）**：桌面宽屏、完整注册/登录链路、暗色对比度、弱网耗时、无障碍键盘流。

## 1. 总体判断

信息架构清晰度一般：品牌与标题偏「AI 工具收录」，首屏主叙事却是「热门文章」。新用户会犹豫「导航站还是内容站」。视觉蓝白清爽、出处标注方向正确；主要短板在**加载空闪、首屏占位过高、热门/时间戳信任感、详情决策信息不足**。

## 2. 迭代看板（勾选推进）

优先级：`P0` 信任/可用性 · `P1` 转化与决策 · `P2` 体验打磨。  
状态：`todo` → `doing` → `done` / `wontfix`。

| ID | P | 主题 | 状态 | 建议落地模块 | 验收要点 |
| --- | --- | --- | --- | --- | --- |
| UX-01 | P0 | 加载中勿闪「空」 | done | `Home.vue`（及同类列表） | 请求未完成只显示 skeleton；完成后才允许「暂无」 |
| UX-02 | P0 | 详情/列表加载反馈 | done | `ToolDetail.vue`、`Search.vue`、`PostDetail` | 骨架或 spinner；慢网 >1s 仍有明确等待态 |
| UX-03 | P0 | 时间戳可信 | done | seed / posts API / 列表展示 | 避免大批同秒时间；列表用相对时间或去掉秒 |
| UX-04 | P1 | 首屏价值主张统一 | done | `Home.vue` + Header IA | 明确「内容为主 / 工具为主」；首屏可见主内容卡 |
| UX-05 | P1 | 移动顶栏占屏过高 | done | `AppHeader` / `CategoryNav` | 登录进菜单；分类「更多」抽屉；Hero 压缩 |
| UX-06 | P1 | 「热门」标签通胀 | done | Feed / ToolCard / 热榜规则 | 限制数量或改为今日/本周/精选 |
| UX-07 | P1 | 工具详情可决策 | done | `ToolDetail.vue` + 数据字段 | 免费/付费、国内可用、场景、对比至少 2 项 |
| UX-08 | P1 | 搜索空/薄结果引导 | done | `Search.vue` + `SearchBar` | 0 结果给热词/分类；示例词可点 |
| UX-09 | P2 | 文章页厚度 / 热榜去重 | done | `PostDetail` + 热榜排序 | 正文可读；热榜与 Feed 不全量重复 |
| UX-10 | P2 | 试用入口预览 | done | `Trial.vue` + 鉴权策略 | 未登录可见示例/额度说明，再引导登录 |
| UX-21 | P0 | 空搜文章引导 | done | `Search.vue` + `matchPostsByQuery` | 工具 0 结果时链相关文章；标明仅工具 |
| UX-22 | P0 | 去掉假「充值」 | done | `Trial.vue` · `useTrialChat.js` | 用户可见文案无「充值」 |
| UX-23 | P0 | 正文去重补厚 | done | `server/seed.js` | 无连续重复 BODY_PAD；≥280 |
| UX-24 | P0 | 登录弹层 CTA 可见 | done | `AuthModal.vue` | 窄屏主提交按钮可见（sticky） |
| UX-25 | P1 | 三套分类并行 | done | Home 标签说清 | topic=文章；chip=搜工具；条=工具分类 |
| UX-26 | P1 | 内容页挂工具分类条 | done | `shouldShowCategoryNav` | 内容/试用隐藏 |
| UX-27 | P1 | 导航三套重叠 | done | AppHeader | 汉堡开时藏分类条 |
| UX-28 | P1 | Hero 说明书腔 | done | `Home.vue` | 短主张 + 试用链 |
| UX-29 | P1 | document.title 不变 | done | router + documentTitle | 按路由设 title |
| UX-30 | P1 | /news 首进空闪 | done | News / Tutorials | loading/空态区分 |
| UX-31 | P1 | 未登录真试用 | todo | Trial（需新 ADR） | 本期 out of scope |
| UX-32 | P2 | 工具卡无图标 | todo | ToolCard / seed icon | 占位色板 |
| UX-33 | P2 | JWT/防刷话术 | todo | AuthModal | 白话 |
| UX-34 | P2 | 精选与 Feed 重复 | todo | （Week B 已有去重，复查线上） | 手测 |
| UX-35 | P2 | About 叙事过时 | done | `About.vue` | 对齐 Feed+试用 |
| UX-36 | P2 | 灯泡主题语义 | todo | 主题控件 | 日/月图标 |

## 3. 分项说明（证据 → 建议）

### UX-01 · 加载中勿闪「空」

- **现象**：刷新 `/` 短暂出现「该分类暂无文章 / 暂无热门工具 / 暂无热榜」，再被真实数据替换。
- **原因倾向**：`v-if="!list.length"` 未区分 `loading` 与真正空。
- **建议**：`loading` 时 skeleton；仅 `!loading && length===0` 显示空文案。
- **风险**：用户误判站点无内容，跳出率上升。

### UX-02 · 详情/列表加载反馈

- **现象**：`/tool/chatgpt` 长时间纯文字「加载中…」，无骨架。
- **建议**：卡片级 skeleton；失败态给「重试」而非空白。

### UX-03 · 时间戳可信

- **现象**：多篇文章同为 `2026-10-20 17:56:19`，像批量入库。
- **建议**：入库打散或保留真实源发布时间；UI 显示「2 天前」/ 日期即可。

### UX-04 · 首屏价值主张统一

- **现象**：分类条=工具导航，Hero=文章专区，搜索=找工具，叙事打架。
- **建议**：与 ADR「首页 Feed 为主 + 下方热门工具」对齐——首屏强化 Feed，工具分类可次级展示或折叠；文案与搜索范围一致（搜工具 vs 搜文章需标明）。

### UX-05 · 移动顶栏占屏过高

- **现象**：Logo + 登录注册 + 横向分类 + Hero + 搜索占满首屏，内容卡需下滑才见。
- **建议**：登录/注册收进汉堡菜单；分类横滑加「更多」；缩短 Hero 标题区。

### UX-06 · 「热门」标签通胀

- **现象**：Feed、工具卡、热榜几乎处处「热门」。
- **建议**：热门配额（如每 topic ≤3）；侧栏热榜用点击/收藏真实序，或改名「精选」。

### UX-07 · 工具详情可决策

- **现象**：首字母图标 + 一句话简介 +「访问官网」，选型信息不足。
- **建议**：补充定价形态、地区可用性、适合场景、相关工具对比（已有 related-tools 资产可复用）。

### UX-08 · 搜索引导

- **现象**：有结果时卡仍偏薄；空结果缺下一步。
- **建议**：placeholder 示例做成可点芯片；0 结果推荐分类/热搜词。

### UX-09 · 文章厚度与热榜去重

- **现象**：`/news/1` 近似标题页；热榜与主 Feed 标题高度重叠。
- **建议**：保证详情有可读正文段落；热榜算法与 Feed 排序解耦。

### UX-10 · 试用入口预览

- **现象**：`/trial` 未登录只有登录墙，无能力预览。
- **建议**：展示示例对话截图/只读 demo + 额度说明，CTA 再登录（作品集主角叙事不变）。

## 4. 已做得好的点（迭代时保留）

- 蓝白主题与暗色切换方向清晰（灯泡语义需继续保持可理解）。
- 文章注明出处，符合内容站信任基本盘。
- 分类导航、搜索路由、工具详情「相关工具」骨架已具备，可在其上加厚而非重做。

## 5. 建议迭代顺序（1～2 周切片）

```text
Week A（信任）: UX-01 → UX-02 → UX-03
Week B（首屏）: UX-04 → UX-05 → UX-06
Week C（转化）: UX-07 → UX-08 → UX-09 → UX-10
```

每项开工前：若涉及产品取舍 → 先补/改 ADR → 测试边界/条例 → 再 `spdd-reasons-canvas` → `spdd-generate`。

## 6. Open Questions

- [x] 首页长期以「文章 Feed」还是「工具导航」为对外主叙事？→ Feed；搜索标明仅工具（`ADR-20261021-ux-week-bc`）
- [x] 搜索是否同时覆盖文章与工具？→ 本期仅工具
- [x] 「热门」是否改为运营手动置顶，还是行为数据排序？→ 运营 `is_hot` + 配额；侧栏「精选」去重
- [x] Trial 是否允许未登录试用 N 条？→ 否，仅静态预览

## 7. Recommended Next

1. ~~Sprint A~~：UX-21～24 → `canvases/20261021-ux-sprint-a-loops.md`
2. ~~Sprint B~~：UX-25～30 → `canvases/20261021-ux-sprint-b-ia.md`
3. **Next · Sprint C**：UX-32～36（观感；UX-31 匿名试用需另开 ADR，默认跳过）
4. 部署：重建前端 + 重启 API；可选 rag 摘要。
