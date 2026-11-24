# 测试边界 · 404Home 架构基线

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`；`ADR-20261021-spdd-superpowers-ponytail.md`
- Related canvas: `docs/spdd/canvases/20261021-arch-slim-agent-stack.md`
- Related 条例: `docs/spdd/4-测试条例/404home-architecture-cases.md`
- Related 规范: `docs/spdd/1-资产规范/404home-architecture.md`
- Updated: 2026-10-21

## 1. System under test

全站不变量：双角色 JWT、金额单位、错误体、密钥边界、工具数据来源（DB）。

## 2. In scope

- user / admin JWT 不可互换访问对侧 API（P0 → `404home/server/test/architecture-p0.test.js`）
- 金额以分为单位；余额不可为负（抽样与钱包/聊天交叉）
- API 未认证返回 401；错误 JSON 含 `error`（同上 architecture-p0）
- 前端源码中无 DeepSeek/微信等密钥字符串（抽查 → architecture-p0 TC-04）
- 工具列表/热门不来自前端硬编码常量表
- Header「工具集」仅在首页 exact 高亮（非全站常驻；手测）

## 3. Out of scope（刻意不测）

- 部署机 SSH/Nginx 运维步骤
- 备案/HTTPS 证书申请流程
- CMS 全量 CRUD 矩阵（属 admin 功能，非本基线）

## 4. Risk hotspots

| Area | Why risky | Coverage intent |
| --- | --- | --- |
| 跨角色 JWT | 越权读写 | P0 负例 |
| 密钥进仓 | 泄露 | 静态抽查 |
| 裸改余额 | 账务不一致 | 与 wallet 交叉 |

## 5. Dependencies & doubles

| Dependency | Real / Fake / Stub | Notes |
| --- | --- | --- |
| SQLite | Real（测试库或本地） | 勿用生产 db |
| DeepSeek | N/A | 基线不调上游 |

## 6. Environments

- Local: `npm run serve` + `npm run server`
- CI: 待定
- Forbidden: 对生产 IP 跑破坏性写操作；提交 `deploy.local.md` 密钥
