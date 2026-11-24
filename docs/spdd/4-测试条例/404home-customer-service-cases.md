# 测试条例 · 404Home 全站客服

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261024-customer-service.md`
- Related boundary: `docs/spdd/3-测试边界/404home-customer-service.md`
- Related canvas: `docs/spdd/canvases/20261024-customer-service.md`
- Code tests: `404home/server/test/cs-p0.test.js`
- Updated: 2026-10-24

## Cases

### TC-01 · Guest bootstrap

- Priority: P0
- **Given**: 无 user token
- **When**: `POST /api/cs/guest`
- **Then**: 200，返回 JWT + displayName 形如 `游客_` + 后缀；可带着 token 开 session
- **Notes**:

### TC-02 · FAQ / keyword reply

- Priority: P0
- **Given**: 启用话术含 FAQ「充值问题」与关键词「到账」
- **When**: 用户发「充值问题」或含「到账」的消息
- **Then**: bot 消息 body 匹配该话术；未命中走 fallback
- **Notes**:

### TC-03 · Transfer with online agent

- Priority: P0
- **Given**: 至少一名 admin `online=true`
- **When**: 用户 `POST .../transfer`
- **Then**: session `human`，`assignee_admin_id` 为某在线 admin；有 system/agent 分配提示可有可无但 status 正确
- **Notes**:

### TC-04 · Transfer with no online agent

- Priority: P0
- **Given**: 无 online admin
- **When**: transfer
- **Then**: status `queued`；出现系统安慰语（含「排队」类文案）；不把 session 标为 human
- **Notes**:

### TC-05 · Agent reply

- Priority: P0
- **Given**: session human 且 assignee=A
- **When**: A 发消息；B 发消息
- **Then**: A → 200 落库 role=agent；B → 403
- **Notes**:

### TC-06 · No wallet charge

- Priority: P0
- **Given**: 用户有余额
- **When**: 多轮 cs 消息
- **Then**: balance 不变；无 `wallet_ledger` 的 cs/chat 客服流水
- **Notes**:

## Traceability

| Case | Boundary section | Spec / ADR |
| --- | --- | --- |
| TC-01 | §2 guest | ADR-20261024 |
| TC-02 | §2 scripts | ADR-20261024 |
| TC-03–04 | §2 transfer | ADR-20261024 |
| TC-05 | §4 agent | ADR-20261024 |
| TC-06 | §2 isolation | ADR-20261024 |
