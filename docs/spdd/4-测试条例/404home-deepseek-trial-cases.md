# 测试条例 · DeepSeek 试用产品纲领（E2E）

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`
- Related boundary: `docs/spdd/3-测试边界/404home-deepseek-trial.md`
- Related canvas: `docs/spdd/canvases/20261007-deepseek-trial-roadmap.md`
- Code tests: 待补
- Updated: 2026-10-12

## Cases

### TC-01 · 注册登录后聊天扣余额

- Priority: P0
- **Given**: 新用户完成注册登录；服务端可聊天（Key 或 Stub）
- **When**: 在 `/trial` 发送一条消息
- **Then**: 收到回复；余额较发送前减少
- **Notes**: 组合 auth + chat

### TC-02 · 未登录不能调模型

- Priority: P0
- **Given**: 无 user token
- **When**: 直接调 completions
- **Then**: 失败 401
- **Notes**:

### TC-03 · admin 与 C 端登录不可互换

- Priority: P0
- **Given**: 分别持有 admin / user token
- **When**: 交叉访问对方 API
- **Then**: 均失败
- **Notes**:

### TC-04 · 窄屏可用 Trial

- Priority: P1
- **Given**: 视口约手机宽度
- **When**: 登录并打开 `/trial`
- **Then**: 可完成发送消息主路径（非小程序）
- **Notes**: 手测

### TC-05 · 密钥仅服务端（E2E 抽查）

- Priority: P0
- **Given**: 浏览器 Network + 前端包
- **When**: 完成一次聊天
- **Then**: 无 DeepSeek Key 出站到第三方；请求仅本站 API
- **Notes**:

### TC-06 · 微信绑定/合并（占位）

- Priority: P2
- **Given**: 微信 OAuth 未落地
- **When**: —
- **Then**: 跳过；落地后按纲领 D8 补 Given/When/Then
- **Notes**: 明确不做小程序/短信

## Traceability

| Case | Boundary section | Spec / ADR |
| --- | --- | --- |
| TC-01 | E2E In scope | trial §2 + auth/chat |
| TC-02–03 | 鉴权 | trial §2.3 / architecture |
| TC-04 | 移动 Web | trial §2 / roadmap |
| TC-05 | 密钥 | trial §2.9 |
| TC-06 | 规划 | trial §2.4–2.5 |
