# REASONS Canvas · 架构精简 + Superpowers/Ponytail

- Date: 2026-10-21
- Status: synced
- Related analysis: `docs/spdd/analysis/20261021-arch-slim-agent-stack.md`
- Code anchors: `.cursor/rules/ponytail.mdc`；`.cursor/skills/test-driven-development/`；`404home/server/test/architecture-p0.test.js`；`404home/src/composables/useTrialChat.js`；`404home/src/views/Trial.vue`

---

## R · Requirements（为什么、范围）

### Business goal

在作品集冻结栈内：Agent 协作可复现（SPDD + TDD + 精简产出），架构不变量可自动验收，Trial 页面可维护性提升。

### In scope

- Vendoring Ponytail rule/skills 与 Superpowers skills；NOTICE + pinned commit
- SPDD 与两工具定序（ADR + spdd-core + spdd-generate）
- architecture TC-01–03、TC-04 自动化
- Trial → `useTrialChat` 抽出（行为不变）

### Out of scope

- Vite / 微前端 / 新云产品
- 改计费规则、微信登录、HTTPS/备案
- Superpowers brainstorm/writing-plans 替代 SPDD

### Acceptance criteria

- [x] `.cursor/rules/ponytail.mdc` 与 Superpowers/Ponytail skills 在仓；`THIRD_PARTY_NOTICES.md` 有 SHA
- [x] ADR `ADR-20261021-spdd-superpowers-ponytail` accepted；架构边界/条例/规范已更新
- [x] `npm test` 含 architecture-p0，TC-01–03 绿；TC-04 静态抽查
- [x] Trial 逻辑在 composable；`npm test` 与 `npm run build` 通过
- [x] `/trial` 路由仍懒加载进包（build 产物含 trial chunk；运行时冒烟依赖本地/线上环境）

---

## E · Entities（领域对象）

| Entity | Fields / meaning | Persistence |
| --- | --- | --- |
| AgentToolchain | SPDD / Superpowers TDD / Ponytail | `.cursor/**` + ADR |
| ArchInvariant | 双角色 JWT、401、密钥边界 | 测试 + 条例 |

---

## A · Approach（方案与取舍）

### Chosen approach

入仓 skills/rules + SPDD 资产先落；实现用 Superpowers TDD；结构只抽 Trial composable。

### Alternatives considered

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| 仅 marketplace 插件 | 更新方便 | 不入仓、难复现 | 否 |
| 大拆 server/frontend | 看似整洁 | 违反 Ponytail / 冻结 | 否 |
| Vite 迁移 | 现代信号 | 冻结禁止 | 否 |

---

## S · Structure（结构与依赖）

### Modules / files to touch

| Path | Change |
| --- | --- |
| `.cursor/rules/ponytail.mdc` | 新增 alwaysApply |
| `.cursor/skills/ponytail*` / Superpowers skills | vendoring |
| `.cursor/rules/spdd-core.mdc` | 定序补充 |
| `.cursor/skills/spdd-generate/SKILL.md` | TDD gate |
| `THIRD_PARTY_NOTICES.md` | 来源与 SHA |
| `docs/spdd/2-adr决策/ADR-20261021-*.md` | 决策 |
| `docs/spdd/3-测试边界/404home-architecture.md` | 测试路径 |
| `docs/spdd/4-测试条例/404home-architecture-cases.md` | Code tests |
| `docs/spdd/1-资产规范/404home-architecture.md` | 协作栈规则 |
| `docs/spdd/rag/knowledge/spdd-usage.md` | 摘要 |
| `404home/server/test/architecture-p0.test.js` | 新增 |
| `404home/src/composables/useTrialChat.js` | 新增 |
| `404home/src/views/Trial.vue` | 变薄 |

### Dependencies / order

1. 工具入仓与规则
2. ADR → 测试资产 → 规范 → RAG
3. architecture-p0 TDD
4. Trial composable
5. sync + build

---

## O · Operations（有序实现步骤）

### Op 1 · Vendor tools

- **Files**: `.cursor/rules/ponytail.mdc`, `.cursor/skills/*`, `THIRD_PARTY_NOTICES.md`, `spdd-core`, `spdd-generate`
- **Do**: 从上游 pinned 复制；写 NOTICE；改 SPDD 规则
- **Done when**: skills 可读；NOTICE 含 SHA

### Op 2 · SPDD assets

- **Files**: analysis/canvas/ADR；architecture 边界/条例/规范；RAG
- **Do**: 按资产序落盘
- **Done when**: ADR accepted；条例指向测试路径

### Op 3 · Architecture P0 tests

- **Files**: `404home/server/test/architecture-p0.test.js`
- **Do**: TDD 覆盖 TC-01–03；TC-04 扫 `src`
- **Done when**: `npm test` 绿

### Op 4 · Trial composable

- **Files**: `useTrialChat.js`, `Trial.vue`
- **Do**: 抽出会话/流式/余额逻辑；不改计费
- **Done when**: build 过；chat P0 仍绿

### Op 5 · Sync

- **Files**: canvas status、条例 Code tests
- **Do**: 对齐实现；全量 test + build
- **Done when**: acceptance 勾完

---

## N · Norms（怎么写）

- Stack conventions: 现有 Vue3 + Koa + SQLite
- Testing: Superpowers TDD；条例对齐自动化
- Agent: Ponytail 最少必要；有画布禁用 Superpowers brainstorm/writing-plans

---

## S · Safeguards（不许做什么）

- Must not: Vite、改计费、提交密钥、用 brainstorm 替代 SPDD
- Security: 不削弱 JWT 角色隔离
- Rollback / data: 不迁生产 DB
- Explicit errors / HTTP codes: 未认证仍 401 + `{ error }`

---

## Generate 提醒

资产序：**ADR → 测试边界/条例 → 规范 → 代码（SDD+TDD）**。
