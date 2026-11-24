# 测试边界 · ICP / 页脚合规悬挂

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261021-icp-compliance.md`
- Related canvas: `docs/spdd/canvases/20261021-icp-compliance.md`
- Related 条例: `docs/spdd/4-测试条例/404home-icp-compliance-cases.md`
- Updated: 2026-10-21

## 1. System under test

- `404home/src/config/siteCompliance.js`（或等价配置）
- `404home/src/components/AppFooter.vue` 备案链接渲染

## 2. In scope

- 配置存在 ICP 号时：页脚渲染可点击链接，指向工信部查询站，文案为配置中的主体号
- 公安号为空：不渲染公安行
- 公安号非空：渲染公安链接（若配置提供 URL）

## 3. Out of scope（刻意不测）

- 腾讯云/管局备案申请流程、人脸核验、短信核验
- certbot / Nginx 证书续期自动化（运维手测）
- 备案材料 PII

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| 漏挂 ICP | 抽查不合规 | 单元测：有号必渲染 |
| 硬编码散落 | 改号漏改 | 单一配置源 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| 工信部外链 | 不请求 | 只断言 href |

## 6. Environments

- Local: `npm run test:unit`
- CI: 随 vitest
- Forbidden: 提交身份证等材料
