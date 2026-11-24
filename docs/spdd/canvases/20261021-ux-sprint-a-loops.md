# REASONS Canvas · UX Sprint A（UX-21～24 闭环止血）

- Date: 2026-10-21
- Status: synced
- Related analysis: `docs/spdd/analysis/20261021-forty40-ux-review.md`
- Related ADR: `docs/spdd/2-adr决策/ADR-20261021-ux-sprint-a-loops.md`
- Related tests: `3-测试边界/404home-ux-sprint-a-loops.md` · `4-测试条例/404home-ux-sprint-a-loops-cases.md`
- Code anchors: `Search.vue`、`matchPostsByQuery.js`、`Trial.vue`、`useTrialChat.js`、`AuthModal.vue`、`server/seed.js`

---

## R · Requirements

### Business goal

堵住二次走查发现的四条断闭环：空搜死胡同、假充值承诺、正文灌水重复、登录 CTA 被裁切。

### In scope

- UX-21：工具 0 结果时展示相关文章引导 +「仅工具」说明
- UX-22：Trial / 余额不足文案去掉「充值」
- UX-23：seed 补厚不重复粘贴；折叠历史重复
- UX-24：AuthModal 主按钮在窄屏可见

### Out of scope

- 统一全文搜索主结果、支付充值、P1/P2（IA/title/匿名试用等）

### Acceptance criteria

- [x] 搜「RAG」工具 0 条时可见相关文章链与「仅覆盖工具」说明
- [x] Trial 与 INSUFFICIENT_BALANCE 提示无「充值」字样
- [x] seed 后无连续重复 `BODY_PAD`；正文仍 ≥280
- [x] AuthModal 注册表单主按钮 sticky/可见（CSS + 结构）
- [x] P0 自动化绿

---

## E · Entities

| Entity | Meaning |
| --- | --- |
| PostMatch | `filterPostsByQuery(posts, q, limit)` 命中 title/summary |
| BodyPad | seed 补厚块；至多一次 |
| AuthDialogLayout | 弹层 flex + sticky submit |

---

## A · Approach

1. 纯函数 `matchPostsByQuery` + Vitest；Search 在 tools 空时 `getPosts` 再过滤。
2. seed：`collapseRepeatedBodyPads` + thicken 改「最多 pad 一次 + 短填充」。
3. 文案三处替换；AuthModal sticky CTA。

### Alternatives

| Option | Decision |
| --- | --- |
| API `posts?q=` | 否，本期前端过滤够用 |
| C 端充值 | 否，作品集阶段人工加额 |

---

## S · Structure

| Path | Change |
| --- | --- |
| ADR / 边界 / 条例 / analysis 看板 | 本轮资产 |
| `src/utils/matchPostsByQuery.js` + `.spec.js` | UX-21 |
| `src/views/Search.vue` | 空态文章引导 |
| `src/views/Trial.vue` · `composables/useTrialChat.js` | UX-22 |
| `server/seed.js` · `server/test/ux-sprint-a-p0.test.js` | UX-23 |
| `src/components/AuthModal.vue` | UX-24 + 可选去 JWT 话术（同文件最小改） |

### Dependencies

ADR → 测试资产 → 红测 → 实现 → 看板 done

---

## O · Operations

### Op 1 · 资产

- **Done when**: ADR / 边界 / 条例 / 本画布落地

### Op 2 · 红测

- **Files**: `matchPostsByQuery.spec.js`、`server/test/ux-sprint-a-p0.test.js`
- **Do**: 先写失败用例（匹配、无重复 pad、正文长度）
- **Done when**: 确认红

### Op 3 · 实现

- **Do**: Search 引导、文案、seed、AuthModal
- **Done when**: 用例绿；手测搜 RAG / 开注册弹层

### Op 4 · 回写

- **Do**: analysis 看板 UX-21～24 → done；画布 synced

---

## N · Norms

- 无新依赖；搜索仍标明仅工具
- 文章引导 limit ≤5
- sticky CTA 用现有 CSS 变量

---

## S · Safeguards

- Must not: 未登录调模型；伪造充值入口；删正文长度下限
- Must not: 扩大 scope 到统一搜索 / 支付

---

## Sync log

| Date | Drift | Action |
| --- | --- | --- |
| 2026-10-21 | 新建 | active |
| 2026-10-21 | 实现 UX-21～24 | synced |
