# 404Home

AI 工具收录与导航站点。按场景整理写作、图像、视频、办公、编程等常用 AI 工具，并提供资讯/教程与管理后台。

仓库：https://github.com/Forty400/404Home

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前台 | Vue 3、Vue Router、Vue CLI |
| 后端 | Koa、koa-router、JWT |
| 数据库 | SQLite（better-sqlite3） |

## 环境要求

- Node.js 18+（推荐 LTS）
- npm 8+

## 快速开始

```bash
# 1. 安装前端依赖（在 404home 目录）
npm install

# 2. 安装并启动后端 API
cd server
npm install
npm start
# API: http://localhost:3001

# 3. 另开终端启动前台
cd ..
npm run serve
# 前台: http://localhost:8080
```

也可在根目录一键并行启动（需已分别安装前后端依赖）：

```bash
npm run dev
```

## 管理后台

- 地址：http://localhost:8080/admin
- 默认账号：`admin` / `admin123`（见 `server/.env`，生产环境请修改）

可在后台维护：

- 工具（增删改、热门/最新、启用状态）
- 分类
- 资讯与教程

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run serve` | 启动前台开发服务器 |
| `npm run build` | 前台生产构建 |
| `npm run lint` | 代码检查 |
| `npm run server` | 启动 Koa API |
| `npm run dev` | 同时启动前台与 API |

## 目录结构

```
404home/
├── public/
├── src/
│   ├── api/              # 接口封装
│   ├── components/       # 通用组件
│   ├── layouts/          # 前台/后台布局
│   ├── router/
│   ├── views/            # 页面（含 admin）
│   ├── assets/main.css
│   ├── App.vue
│   └── main.js
├── server/
│   ├── routes/           # auth / tools / categories / posts / stats
│   ├── middleware/
│   ├── data/             # SQLite 数据文件（运行后生成）
│   ├── db.js
│   ├── seed.js
│   ├── index.js
│   └── .env.example
├── vue.config.js         # /api 代理到 :3001
└── package.json
```

## API 概览

- `GET /api/categories`、`/api/tools`、`/api/tools/grouped`、`/api/posts`
- `POST /api/auth/login`
- 管理接口需 `Authorization: Bearer <token>`

开发环境下，前台通过 `vue.config.js` 将 `/api` 代理到后端。

## 浏览器支持

- 全球使用率 > 1%
- 最近 2 个版本
- 不支持 IE 11

## 许可证

Private
