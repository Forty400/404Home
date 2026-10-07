---
title: 404Home 部署与运维
tags: [404home, deploy, ops, vps, ssh]
updated: 2026-10-06
---

# 404Home 部署与运维

## 线上

- 公网：`http://206.187.209.48/`
- 管理：`http://206.187.209.48/admin`
- 工具详情：`http://206.187.209.48/tool/<slug>`（例：`/tool/chatgpt`）
- 服务器目录：`/var/www/404home`
- 进程：pm2 `404home-api`（Koa :3001）
- Web：Nginx 80，`/api` 反代到 3001，SPA `try_files`

## 如何登录 Ubuntu

本机终端：

```bash
ssh root@206.187.209.48
```

- 这是**命令行**，不是图形桌面。
- 账号与密码见本地 `404home/deploy.local.md`（已 gitignore）。
- SSH 失败时用商家面板 **VNC / 网页终端**。
- **开发阶段禁止自动改 SSH 密码。**

## 常用命令（服务器）

```bash
cd /var/www/404home
pm2 status
pm2 logs 404home-api --lines 50
pm2 restart 404home-api
npm run build
nginx -t && systemctl reload nginx
curl -s http://127.0.0.1:3001/api/health
```

## 本机放行提示

- 管理机公网 IPv4 见 `deploy.local.md`
- SSH 22 建议仅放行管理机 `/32`；80/443 可对公网开放
