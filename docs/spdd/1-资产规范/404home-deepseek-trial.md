# 规范 · DeepSeek 试用产品纲领

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-specs-by-module.md`
- Related canvas: `docs/spdd/canvases/20261007-deepseek-trial-roadmap.md`（draft）
- Related analysis: `docs/spdd/analysis/20261007-deepseek-trial.md`
- Related tests: `3-测试边界/404home-deepseek-trial.md` · `4-测试条例/404home-deepseek-trial-cases.md`
- Updated: 2026-10-12
- Source confidence: planning（纲领 draft；落地以子画布 + 各模块规范为准）

## 1. Scope

跨阶段产品与安全纲领（P0–P5）。实现时以**阶段子画布**为 SoT，本文件约束跨阶段不变量。UI 视觉以 `404home-theme.md` 为准（纲领中「纸感」已废止）。

## 2. Rules

1. 交付按阶段子画布推进，漂移时 sync roadmap。
2. 路由前缀约定：`/api/user`、`/api/chat`、`/api/wallet`。
3. 未登录不得调模型 API；双端 Web 会话服务端统一（最终一致可接受）。
4. 长期登录：主路径微信网站应用 OAuth，备援邮箱密码；支持绑定/合并；注销软删 + 标识（邮箱/UnionID）**30 天**冷却（D8）。
5. **不做**：短信/手机号登录；微信小程序（D10）；生产 mock 微信或关验证码。
6. 域名（D11，已修订 `ADR-20261021-icp-compliance`）：ICP 已通过后对外主入口为 `forty40.online` + HTTPS；过渡期仍可用 IP 回退。页脚悬挂主体备案号。
7. 防滥用：验证码、注册 IP 限制、聊天 QPS、日消费上限（分析约束）。
8. 内容合规阶段一：长度/频率；暂不全量敏感词库（D9）。
9. 运维假设：DeepSeek 池约 ¥100 人工采购；注册赠 ¥3；密钥仅 env / 私密文件。
10. 账号合并写 `account_merge_events`；合并需二次确认。
11. Trial 入口文案可称「DeepSeek 试用」；品牌仍为 404Home，禁止规模化复制 DeepSeek 品牌素材。

## 3. Examples

**Good**

- 邮箱或微信登录后聊天扣余额；冲突账号走合并或删一留一流程。

**Bad**

- 小程序发包带 Key；生产关验证码；admin/C 端登录互通。

## 4. Enforcement

- 子规范优先：`404home-auth` / `wallet` / `deepseek-chat` / `admin-chats` / `theme` / `architecture`
- 纲领与子规范冲突时：已 accepted 的子模块规范 + 较新 synced 画布优先，并回写本文件或开新 ADR
