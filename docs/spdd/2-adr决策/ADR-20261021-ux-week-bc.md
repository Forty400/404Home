# ADR-20261021 · UX Week B/C 产品取舍（首屏 / 热门 / 详情 / Trial 预览）

- Status: accepted
- Date: 2026-10-21
- Deciders: user（继续做到 UX-10）+ AI（按 forty40 UX review + 既有资产拍板）
- Related canvas: `docs/spdd/canvases/20261021-ux-week-bc.md`
- Related analysis: `docs/spdd/analysis/20261021-forty40-ux-review.md`
- Supersedes: （局部放宽）`404home-tool-detail` 规范「本功能不改 SQLite schema」
- Superseded by:

## Context

UX review 开题：首页叙事打架、「热门」通胀、工具详情不可决策、搜索无引导、热榜与 Feed 重叠、Trial 未登录硬墙。Open Questions 需拍板后才能实现 UX-04～10。

## Decision

1. **主叙事（UX-04）**：维持 `ADR-20261021-hot-articles-home`——`/` 以文章 Feed 为主；搜索**仅工具**，文案标明「搜工具」。工具分类条保留但为次级发现。
2. **热门（UX-06）**：运营布尔 `is_hot` 保留；seed/启动时**配额**：文章每 `topic` ≤3；工具全局 ≤8。侧栏改称「精选」，且与主 Feed 去重（UX-09）。
3. **工具决策字段（UX-07）**：`tools` 增 `pricing` / `region_avail` / `scenario`（TEXT，默认可空）；详情展示 + admin 可编；相关工具对比沿用既有区块（≥2 条时可见）。
4. **Trial（UX-10）**：**静态预览**（示例气泡 + 额度说明 + 登录 CTA）；**未登录不调模型 API**（不放宽 `404home-deepseek-trial` TC-02）。
5. **搜索（UX-08）**：本期不分区搜文章；空态/无结果给可点热词与分类入口。

## Consequences

**Positive**

- 与既有 Feed ADR / Trial 鉴权边界一致；改动面可控
- 热门视觉噪声下降；详情选型信息可运营

**Negative / Trade-offs**

- 搜索仍不含文章（需文案说清）
- 静态 Trial 预览无真模型体验

## Follow-ups

- [x] `3-测试边界/404home-ux-week-bc.md` · `4-测试条例/404home-ux-week-bc-cases.md`
- [x] 修订 `1-资产规范/404home-tool-detail.md`（允许三字段）
- [ ] 实现后可选摘要 `rag/knowledge/`
