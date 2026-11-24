---
title: 404Home 部署与运维
tags: [404home, deploy, ops, vps, ssh]
updated: 2026-10-21
---

# 404Home 部署与运维

## 线上（腾讯云，唯一生产）

- 公网 IP：`http://111.230.147.223/`（**当前可正常访问**）
- 管理：`http://111.230.147.223/admin`
- 试用：`http://111.230.147.223/trial`
- 工具详情：`http://111.230.147.223/tool/<slug>`
- 域名：`forty40.online` / `www.forty40.online`（DNS A 已指向 `111.230.147.223`）
- ICP（广东个人主体号，页脚悬挂）：`粤ICP备2026157903号` → [工信部](https://beian.miit.gov.cn/)
- 服务器目录：`/var/www/404home`（`dist` + `server`）
- 进程：pm2 `404home-api`（Koa :3001）
- Web：Nginx 80，`server_name` 含域名；`/api` 反代到 3001，SPA `try_files`
- SSH：`ssh ubuntu@111.230.147.223`（账号密码见本地 `404home/deploy.local.md`）
- 最近部署：2026-10-23（自定义 favicon 替换 Vue 默认标；前端 `app.a634d7af.js`；API health ok）

## 域名与 HTTPS（ICP 已通过）

- ICP：`粤ICP备2026157903号`（2026-10-21 已确认）。广东页脚挂**主体号** → [工信部](https://beian.miit.gov.cn/)。
- 前端配置：`404home/src/config/siteCompliance.js`（`icpNumber` / `icpUrl`；公安号空则不渲染）。
- ADR / 画布：`ADR-20261021-icp-compliance` · `canvases/20261021-icp-compliance.md`。
- Nginx 已预写域名；确认域名可直连本机（非 DNSPod 拦截）后执行：

```bash
sudo certbot --nginx -d forty40.online -d www.forty40.online
```

- 网站开通后 **30 日内**办公安联网备案；通过后把号写入 `siteCompliance.policeNumber` / `policeUrl` 并重新部署。
- 过渡期仍可用 IP 验收。

## 已废弃

- 香港机：`206.187.209.48` — **废弃，后续不再使用**（勿部署、勿解析、勿当生产）。

## 如何登录 Ubuntu

```bash
ssh ubuntu@111.230.147.223
```

- 账号与密码见本地 `404home/deploy.local.md`（已 gitignore）。
- **开发阶段禁止自动改 SSH 密码。**

## 常用命令（服务器）

```bash
cd /var/www/404home
pm2 status
pm2 logs 404home-api --lines 50
pm2 restart 404home-api
nginx -t && systemctl reload nginx
curl -s http://127.0.0.1:3001/api/health
curl -s http://127.0.0.1/api/health
```

## 部署要点

- 运行时：Node 20、Nginx、pm2（用户 `ubuntu`，开机自启 `pm2-ubuntu`）
- 生产 `.env` 与 SQLite 仅在服务器 `server/.env` / `server/data/`；上传时勿覆盖
- 本地可参考 `404home/scripts/_deploy_once.py`（读 `deploy.local.md`，打包 dist+server 代码）
- 安全组至少放行 22 / 80 / 443
- 主机 UFW：已启用，放行 22/80/443
