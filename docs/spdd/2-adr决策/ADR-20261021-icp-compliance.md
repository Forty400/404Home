# ADR-20261021 · 大陆生产启用域名必须以 ICP 为前提

- Status: accepted
- Date: 2026-10-21
- Deciders: user + AI（依据 `analysis/20261021-icp-filing.md` D1–D5）
- Related canvas: `docs/spdd/canvases/20261021-icp-compliance.md`
- Related analysis: `docs/spdd/analysis/20261021-icp-filing.md`
- Supersedes: Trial 纲领 D11「先 IP、暂缓域名」作为**生产终态**（过渡期 IP 回退仍可）
- Superseded by:

## Context

生产已迁腾讯云大陆机，域名 `forty40.online` DNS 已指向该机。未备案时国内域名拦截、HTTPS 申请失败。主办者已完成广东个人 ICP，主体号 `粤ICP备2026157903号`。工程侧需把「可 IP 验收」升级为「域名 + 页脚悬挂 + HTTPS」合规基线，并废止港机免备案叙事。

## Decision

1. **大陆腾讯云生产对外主入口**在 ICP 通过后启用域名；页脚必须悬挂**主体备案号**并链到 `https://beian.miit.gov.cn/`（广东规则）。
2. 备案号与（可选）公网安备号放在前端 **站点合规配置**（常量或 `VUE_APP_*`），空公安号则不渲染；禁止把身份证等备案材料写入 git。
3. HTTPS：域名可直连后对 `forty40.online` / `www` 执行 certbot；过渡期仍允许 IP 访问。
4. 公安联网备案由主办者在开通后 **30 日内**办理；通过后再填配置并部署。
5. 公开页脚**不链管理后台**（个人站口径）；`/admin` 仍可直访。
6. 修订 Trial 纲领 D11：备案完成后以 HTTPS 域名为目标态，IP 仅回退。

## Consequences

**Positive**

- 国内可用域名；合规抽查有页脚证据
- 与 deploy 知识、分析清单一致

**Negative / Trade-offs**

- 公安号未出前页脚仅 ICP
- 个人主体 vs 计费产品长期仍有抽查风险（产品文案约束，见分析）

## Follow-ups

- [x] 画布 + 测试边界/条例
- [x] Footer 配置化与悬挂
- [ ] 生产 certbot HTTPS（运维，域名可直连后）
- [ ] 公安备案通过后填号并部署
- [x] 更新 `404home-deploy` / Trial D11
