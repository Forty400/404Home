---
title: 404Home 部署与运维
tags: [404home, deploy, ops, vps]
updated: 2026-10-02
---

# 404Home 部署与运维

## 线上

- 公网：`http://206.187.209.48/`
- 管理：`http://206.187.209.48/admin`
- 服务器目录：`/var/www/404home`
- 进程：pm2 `404home-api`（Koa :3001）
- Web：Nginx 80，`/api` 反代到 3001，SPA `try_files`

## 本地私密备忘

- `404home/deploy.local.md`（已 gitignore）含 IP、SSH、放行 IP 等
- **开发阶段禁止自动改 SSH 密码**

## 常用命令（服务器）

```bash
pm2 status
pm2 restart 404home-api
nginx -t && systemctl reload nginx
```

## 本机放行提示

- 管理机公网 IPv4 见 `deploy.local.md`
- SSH 22 建议仅放行管理机 `/32`；80/443 可对公网开放
