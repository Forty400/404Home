# 404Home

基于 Vue 3 的前端项目，使用 Vue CLI 搭建。

仓库地址：https://github.com/Forty400/404Home

## 技术栈

| 技术 | 版本 / 说明 |
| --- | --- |
| Vue | ^3.2.13 |
| Vue CLI | ~5.0.0 |
| Babel | @vue/cli-plugin-babel |
| ESLint | Vue 3 Essential + eslint:recommended |
| core-js | ^3.8.3（兼容性 polyfill） |

## 环境要求

- Node.js 16+（推荐 LTS）
- npm 8+（或兼容的包管理器）

## 快速开始

```bash
# 进入项目目录
cd 404home

# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run serve
```

浏览器访问终端提示的本地地址（默认 `http://localhost:8080`）。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run serve` | 开发模式编译并热更新 |
| `npm run build` | 生产环境打包，输出到 `dist/` |
| `npm run lint` | 检查并修复代码风格问题 |

## 目录结构

```
404home/
├── public/                 # 静态资源（不经 webpack 处理）
│   ├── favicon.ico
│   └── index.html          # HTML 模板
├── src/
│   ├── assets/             # 图片等资源
│   ├── components/         # 可复用组件
│   │   └── HelloWorld.vue
│   ├── App.vue             # 根组件
│   └── main.js             # 应用入口
├── babel.config.js         # Babel 配置
├── jsconfig.json           # 路径别名（@ → src）
├── vue.config.js           # Vue CLI 配置
├── package.json
└── README.md
```

路径别名：在代码中可使用 `@/` 指向 `src/`，例如：

```js
import HelloWorld from '@/components/HelloWorld.vue'
```

## 配置说明

项目配置集中在 `vue.config.js`，当前启用了 `transpileDependencies`。更多选项见 [Vue CLI 配置参考](https://cli.vuejs.org/zh/config/)。

本地环境变量可使用：

- `.env.local`
- `.env.*.local`

上述文件已在 `.gitignore` 中忽略，不会提交到仓库。

## 浏览器支持

按 `browserslist` 配置：

- 全球使用率 > 1%
- 最近 2 个版本
- 排除已停止维护的浏览器
- 不支持 IE 11

## 许可证

Private（私有项目）
