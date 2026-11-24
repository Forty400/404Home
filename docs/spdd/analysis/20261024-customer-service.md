# Analysis · 全站机器人客服（话术 + 转人工）

- Date: 2026-10-24
- Author: agent + partner
- Status: ready
- Related canvas: `docs/spdd/canvases/20261024-customer-service.md`

## 1. Problem

站点缺少顶层客服入口。用户（含游客）无法快速问常见问题；运营无法在后台用同一会话接人工。现有 DeepSeek 试用聊天是计费 LLM 通道，不是客服工作台。

## 2. Goals / Non-goals

**Goals**

- 全站右下角客服入口：桌面侧栏面板、手机底部抽屉
- 游客自动身份「游客+数字/英文后缀」；已登录用户用自己的账号
- 机器人固定话术：FAQ 按钮 + 关键词匹配打字
- 转人工：有在线客服则分配到人；无人则安慰剂「当前询问人数过多，正在排队」
- 后台三栏工作台：队列 | 聊天 | 用户信息；「我在线」只影响接入分配
- 管理员全局设置优先（本期限话术模式配置）

**Non-goals**

- AI / DeepSeek 客服回复（下期）
- 独立客服角色表（本期管理员账号即可接单）
- WebSocket / SSE（本期短轮询）
- 与试用钱包计费打通（客服通道不计费）

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| 游客 | 打开浮层点「充值问题」或打字 | 得到话术回复；身份为游客+后缀 |
| 登录用户 | 同上 | 会话挂在本人 user_id |
| 用户 | 点转人工，有人在线 | 同一窗口收到人工回复 |
| 用户 | 点转人工，无人在线 | 看到排队安慰语，不假接通 |
| 管理员/客服 | 点「我在线」接单 | 待接入分给自己；可回复 |
| 管理员 | 配置话术与 FAQ | 前端按钮与关键词生效 |

## 4. Constraints

- Tech: 现有 Express + SQLite + Vue；双 JWT（user/admin）；无 realtime 基建
- Time: 一期交付话术 + 转人工 + 工作台
- Ops / security: 游客身份不可冒充他人；admin 才能接单与改话术；客服消息不计费

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 与试用 chat 表混用 | 计费/审计污染 | 独立 `cs_*` 表与 `/api/cs` |
| 游客刷号 | 垃圾会话 | 设备 cookie/localStorage 复用同一游客；限创建会话 |
| 轮询延迟 | 人工回复不及时 | 2–3s 短轮询；文档标明 |

## 6. Open Questions

- [x] 无人在线文案 → 排队安慰剂
- [x] 在线按钮职责 → 只控分配
- [x] 本期不做 AI
- （Builder 可自决）轮询间隔默认 2.5s；游客后缀格式 `游客_` + 6 位 base36

## 7. Recommended Next

→ 生成 REASONS Canvas：`docs/spdd/canvases/20261024-customer-service.md`  
→ generate 前先落 ADR → 测试边界/条例 → 规范 → 代码（SDD+TDD）
