# REASONS Canvas · P2 DeepSeek 代理与扣费聊天

- Date: 2026-10-07
- Status: synced
- Related analysis: `docs/spdd/analysis/20261007-deepseek-trial.md`
- Code anchors: `404home/server/`、`404home/src/views/Trial.vue`

---

## R · Requirements

### Business goal

登录用户在 `/trial` 真实调用 DeepSeek（非流式），按 token 折合人民币「分」扣余额；Key 仅服务端；无 Key / 余额不足有明确错误。

### In scope

- `chat_sessions` / `chat_messages` 落库
- `POST /api/chat/completions`（user JWT）：创建或续会话、调 DeepSeek、扣费、返回助手消息与新余额
- `GET /api/chat/sessions`、`GET /api/chat/sessions/:id/messages`
- 可配置模型与单价系数；最低扣 1 分（有用量时）
- 管理员 `POST /api/wallet/admin-credit` 加额（计入累充；升档逻辑简化：仅更新累充与 cap/档差，按 VipTier 表）
- 更新 Trial.vue 接真 API

### Out of scope

- 流式 SSE（D6）
- 微信登录、域名
- 完整 VIP 中间档 UI

### Acceptance criteria

- [ ] 有 Key 时可对话，余额减少且 ledger 有 `chat` 流水
- [ ] 余额 0 拒绝新请求 `INSUFFICIENT_BALANCE`
- [ ] 无 Key 返回 `DEEPSEEK_NOT_CONFIGURED`
- [x] 会话可列表与拉取历史（Trial 侧栏 + 删除）

---

## E · Entities

| Entity | Persistence |
| --- | --- |
| ChatSession | chat_sessions |
| ChatMessage | chat_messages |
| VipTier config | `server/config/vipTiers.js` |

---

## A · Approach

- OpenAI 兼容：`https://api.deepseek.com/chat/completions`，默认模型 `deepseek-flash`（可用 env `DEEPSEEK_MODEL` 覆盖，如 `deepseek-v4-pro`）
- 计价：env 配置每百万 token 美元价 × `USD_CNY` × `BILLING_MARKUP`，折算分并 `ceil`，至少 1 分
- 扣费事务：先查余额>0 → 调 API → 算费 → UPDATE 余额（不小于 0）+ ledger + 消息

---

## S · Structure

| Path | Change |
| --- | --- |
| `server/db.js` | sessions/messages |
| `server/config/vipTiers.js` | 档位表 |
| `server/services/deepseek.js` | 调用与计价 |
| `server/services/wallet.js` | 扣费/加额/升档 |
| `server/routes/chat.js` | 聊天 API |
| `server/routes/wallet.js` | admin 加额 |
| `server/index.js` | 挂载 |
| `server/.env.example` | DEEPSEEK_* |
| `src/api/index.js` | chat/wallet |
| `src/views/Trial.vue` | 真对话 |

---

## O · Operations

### Op 1 · Schema + vip config + wallet service
### Op 2 · deepseek service + chat routes
### Op 3 · admin credit route
### Op 4 · Trial.vue + api client

---

## N · Norms

- 金额分；错误带 `code`
- Key 不进前端

## S · Safeguards

- 禁止前端直连 DeepSeek
- 禁止负余额
- 生产勿把 CAPTCHA_DEBUG / Key 提交 git

## Sync log

| Date | Action |
| --- | --- |
| 2026-10-07 | 开工 P2 |
