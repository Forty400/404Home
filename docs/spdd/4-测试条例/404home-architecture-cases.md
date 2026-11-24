# 测试条例 · 404Home 架构基线

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`；`ADR-20261021-spdd-superpowers-ponytail.md`
- Related boundary: `docs/spdd/3-测试边界/404home-architecture.md`
- Related canvas: `docs/spdd/canvases/20261021-arch-slim-agent-stack.md`
- Code tests: `404home/server/test/architecture-p0.test.js`（TC-01–04）；TC-06 手测
- Updated: 2026-10-21

## Cases

### TC-01 · 未认证访问受保护用户 API

- Priority: P0
- **Given**: 无 `Authorization`（或无效 token）
- **When**: 请求需 user 的 `/api/user/*` 或聊天接口
- **Then**: `401`，body 含 `error`
- **Notes**:

### TC-02 · admin JWT 不能访问用户 API

- Priority: P0
- **Given**: 有效 admin JWT
- **When**: 调用 `/api/user/*` 或 `POST /api/chat/completions`
- **Then**: 拒绝（401/403），不得当作用户成功执行
- **Notes**:

### TC-03 · user JWT 不能访问 admin 专属接口

- Priority: P0
- **Given**: 有效 user JWT
- **When**: 调用 `/api/wallet/admin-credit` 或 chat admin 接口
- **Then**: 拒绝
- **Notes**:

### TC-04 · 前端源码无第三方密钥

- Priority: P0
- **Given**: `404home/src` 与构建产物抽查
- **When**: 搜索 DeepSeek/微信 secret 形态字符串
- **Then**: 无真实密钥；仅可有公开配置名
- **Notes**: 手测/脚本均可

### TC-05 · 工具数据非前端写死

- Priority: P1
- **Given**: 清空或变更 DB 中某工具
- **When**: 前台列表/详情刷新
- **Then**: 展示随 DB 变，非打包常量列表
- **Notes**:

### TC-06 · 「工具集」仅在首页高亮

- Priority: P0
- **Given**: 打开 `/trial` 或 `/news`（非首页）
- **When**: 查看 Header 主导航「工具集」
- **Then**: 无 `router-link-active` / 无 accent 高亮；仅在 `/` 时高亮
- **Notes**: `/` 前缀匹配会导致常驻蓝高亮，须 exact

## Traceability

| Case | Boundary section | Spec / ADR |
| --- | --- | --- |
| TC-01 | In scope 401 | architecture §2.7 |
| TC-02–03 | 双角色 | architecture §2.5 |
| TC-04 | 密钥 | architecture §2.8 |
| TC-05 | 工具来源 | architecture §2.3 |
| TC-06 | 导航激活 | architecture §2.10 |
