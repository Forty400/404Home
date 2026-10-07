# REASONS Canvas · 管理端对话与 Token 用量

- Date: 2026-10-08
- Status: synced
- Related analysis: `docs/spdd/analysis/20261007-deepseek-trial.md`

## R

管理员可查看对话汇总、会话列表（含 tokens/费用）、点进看消息；可按邮箱关键词筛选。只读为主，仅 admin。

## O

1. `GET /api/chat/admin/summary`、`/admin/sessions`、`/admin/sessions/:id`
2. `AdminChats.vue` + 路由/侧栏
3. 部署验证

## Safeguards

- user JWT 不可访问
- 不在前端暴露 Key
