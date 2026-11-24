# ADR-20261021 · UX Sprint A：搜索/试用/正文/登录弹层闭环

- Status: accepted
- Date: 2026-10-21
- Deciders: user（继续 Sprint A）+ AI（forty40 二次体验 UX-21～24）
- Related canvas: `docs/spdd/canvases/20261021-ux-sprint-a-loops.md`
- Related analysis: `docs/spdd/analysis/20261021-forty40-ux-review.md`（增补 UX-21+）
- Extends: `ADR-20261021-ux-week-bc.md`（搜索仍仅工具）

## Context

二次走查（冲浪视角）：首页推文章但搜文章词得 0；Trial 文案写「充值」却无 C 端充值；seed 用同一 `BODY_PAD` 循环补厚导致正文重复；AuthModal 窄屏裁切主 CTA。

## Decision

1. **搜索（UX-21）**：维持「主搜索仅工具」。当工具结果为 0 且有关键词时，**附带相关文章引导**（按 title/summary 匹配，链到 `/news/:id` 或 `/tutorials/:id`），文案写清「搜索仅覆盖工具」。本期**不做**统一搜文章主结果区。
2. **试用额度（UX-22）**：C 端**不承诺充值**。文案与余额不足提示改为「管理员加额 / 联系站长」；不加支付闭环。
3. **正文补厚（UX-23）**：`BODY_PAD` 至多附加一次；seed 启动时折叠已重复段落；保留 ≥280 下限下限。
4. **登录弹层（UX-24）**：弹层在常见移动视口下**首屏可见主提交按钮**（sticky CTA 或取消不当裁切）；不改鉴权流程。

## Consequences

**Positive**

- 文章词空搜不再「死胡同」；试用话术与真实能力一致；正文可读性回升；注册/登录摩擦下降

**Negative / Trade-offs**

- 文章引导是附属列表，非全文搜索引擎
- 额度耗尽仍依赖人工加额（作品集阶段可接受）

## Follow-ups

- [x] `3-测试边界/404home-ux-sprint-a-loops.md` · `4-测试条例/404home-ux-sprint-a-loops-cases.md`
- [x] 实现后看板 UX-21～24 → done
- [ ] 部署线上 + 可选 rag 摘要
