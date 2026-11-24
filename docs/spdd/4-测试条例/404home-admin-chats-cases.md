# 测试条例 · 后台会话审计

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261012-backfill-tests-by-module.md`
- Related boundary: `docs/spdd/3-测试边界/404home-admin-chats.md`
- Related canvas: `docs/spdd/canvases/20261008-admin-chats.md`
- Code tests: 待补
- Updated: 2026-10-12

## Cases

### TC-01 · 管理员查看汇总与会话

- Priority: P0
- **Given**: admin JWT；库中有会话
- **When**: 打开 AdminChats 或调 summary/sessions API
- **Then**: 可见汇总与会话列表（含 tokens/cost 类字段）
- **Notes**:

### TC-02 · 下钻消息

- Priority: P0
- **Given**: 已知 session id
- **When**: 打开会话详情 / `GET .../admin/sessions/:id`
- **Then**: 可见消息内容
- **Notes**:

### TC-03 · 邮箱关键词过滤

- Priority: P1
- **Given**: 多用户会话
- **When**: 按邮箱关键字过滤
- **Then**: 仅匹配用户会话
- **Notes**:

### TC-04 · 用户 JWT 拒绝

- Priority: P0
- **Given**: user JWT
- **When**: 调 admin chat API
- **Then**: 拒绝
- **Notes**:

### TC-05 · 响应无 API Key

- Priority: P0
- **Given**: admin 拉取任意 chat admin 响应
- **When**: 检查 JSON
- **Then**: 不含 DeepSeek Key 或等价密钥字段
- **Notes**:

## Traceability

| Case | Boundary section | Spec / ADR |
| --- | --- | --- |
| TC-01–03 | 只读审计 | admin-chats §2.2–2.4 |
| TC-04 | 权限 | admin-chats §2.1 |
| TC-05 | 密钥 | admin-chats §2.5 |
