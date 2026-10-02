---
title: 404Home 产品与架构概览
tags: [404home, architecture, vue, koa]
updated: 2026-10-02
---

# 404Home 产品与架构概览

## 产品

- AI 工具收录导航站，参考 ai-bot.cn 信息架构，品牌为 404Home。
- 前台：分类浏览、搜索、热门/最新、资讯与教程。
- 后台：`/admin` 登录后 CRUD 工具、分类、文章。

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

## 关键模型

- `categories` / `tools` / `posts`（news|tutorial）/ `admins`
- 热门工具：`tools.is_hot = 1`，URL 等字段均后台配置，非前端写死
