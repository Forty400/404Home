# ADR-20261015 · 作品集窗口范围冻结

- Status: accepted
- Date: 2026-10-15
- Deciders: user + AI
- Related canvas: `docs/spdd/canvases/20261013-portfolio-tech-showcase.md`
- Supersedes:
- Superseded by:

## Context

404Home 同时具备 CMS 导航与「认证 / 钱包 / DeepSeek 试用计费」能力。求职窗口内若继续铺微信、资讯运营或栈迁移，会稀释资深前端可审查的信号，且与已有 SPDD 证据链脱节。

## Decision

1. **作品集主角**：DeepSeek 试用计费闭环（登录 → `/trial` → 服务端代理 → 扣费入账）；AI 工具导航 CMS 为宿主背景。
2. **默认受众**：资深前端 / 全栈前端（AI 应用前端为亮点之一，不独占主叙事）。
3. **窗口内冻结**：微信 OAuth/支付、短信、小程序、资讯/工具运营扩张、多模型/Agent、微前端、全仓 TypeScript、另起玩具 Demo。
4. **现代化切片默认**：阶段 C 做 **性能基线（C3）**；不做本窗口 Vite 全量迁移，除非新开 ADR 改选。
5. **仓库形态**：维持现有公开叙事，不强制拆仓。
6. **证据标准**：对外主张须能链到规范 / ADR / 自动化用例（或明确标注手测）。

## Consequences

**Positive**

- 注意力集中在可演示、可测的计费与鉴权边界
- 与现有四层资产和测试栈一致，迭代可验收

**Negative / Trade-offs**

- 商业完整度（微信/支付）延后
- 栈「一眼现代」（Vite）信号延后到明确改选时

## Follow-ups

- [x] 更新 wallet/chat `3-测试边界` / `4-测试条例`
- [x] 落地 chat/wallet P0 自动化 + README 先看路径
- [x] `ADR-20261015-perf-baseline`（路由已懒加载；记录 build 体积，未改路由代码）
- [x] 需要时摘要进 `rag/knowledge/404home-overview.md`
