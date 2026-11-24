---
title: 404Home 产品与架构概览
tags: [404home, architecture, vue, koa, portfolio]
updated: 2026-10-21
---

# 404Home 产品与架构概览

> 完整规范：`docs/spdd/1-资产规范/404home-architecture.md`  
> 作品集窗口：`docs/spdd/2-adr决策/ADR-20261015-portfolio-freeze.md`

## 产品

- **作品集主角**：DeepSeek 试用计费闭环（`/trial`：注册/登录 → 服务端代理 → 按分扣费）。
- **宿主背景**：AI 工具收录导航（分类/搜索/热门/资讯）+ `/admin` CMS。
- 品牌：404Home。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前台 | Vue 3、Vue Router、Vue CLI |
| 后端 | Koa、koa-router、JWT |
| 数据库 | SQLite（better-sqlite3） |

## 目录要点

- 前端根：`404home/`
- API：`404home/server/`（入口 `index.js`）
- 数据文件：`404home/server/data/404home.db`（运行时生成）
- 开发代理：`vue.config.js` 将 `/api` → `localhost:3001`
- 测试：`404home/npm test`（auth / wallet / chat / architecture P0；DeepSeek 用 `DEEPSEEK_STUB=1`）
- Trial UI 逻辑：`src/composables/useTrialChat.js`；Agent 协作见 `ADR-20261021-spdd-superpowers-ponytail`

## 关键模型

- CMS：`categories` / `tools` / `posts`（type news|tutorial；topic plugin|dev|method|news；source_* / is_hot / cover）/ `admins`
- 宿主首页 `/`：热门文章图文 Feed（见 `ADR-20261021-hot-articles-home`）；Trial 仍为作品集主角
- C 端：`users` / `wallet_ledger` / `chat_sessions` / `chat_messages`
- 热门工具：`tools.is_hot = 1`，URL 等后台配置，非前端写死
