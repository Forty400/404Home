# 规范 · UAT 账号、权限与用户测试指导

- Status: active
- Related config: `404home/uat.local.md`（私密）· `404home/uat.local.example.md`（模板）
- Related analysis: `docs/spdd/analysis/20261021-forty40-ux-review.md`
- Related ADR: `ADR-20261021-ux-week-bc.md`（评价范围拍板）
- Updated: 2026-10-21

## 1. Scope

为**用户体验走查 / 评价打分**提供固定角色、权限边界与可勾选测试指导。  
不含自动化用例编写（见 `3-测试边界` / `4-测试条例`）。

## 2. 配置位置

| 文件 | 可否提交 | 用途 |
| --- | --- | --- |
| `404home/uat.local.example.md` | 可 | 账号字段模板 |
| `404home/uat.local.md` | **否**（gitignore） | 真实口令与环境入口 |
| `404home/server/.env` | **否** | `ADMIN_*` / 可选 `UAT_USER_*` |
| 本文 | 可 | 权限矩阵与测试步骤 |

首次：

```bash
cd 404home
cp uat.local.example.md uat.local.md
# 按服务器 .env 填写 admin 口令；C 端默认账号见 seed
```

## 3. 角色与权限矩阵

| 能力 | guest | user | admin |
| --- | --- | --- | --- |
| 浏览首页 Feed / 精选 / 热门工具 | ✓ | ✓ | ✓ |
| 搜索工具、分类、工具详情 | ✓ | ✓ | ✓ |
| 读文章详情（出处/正文） | ✓ | ✓ | ✓ |
| 注册 / 登录（C 端） | 注册→user | ✓ | — |
| `/trial` 静态预览 | ✓ | ✓ | ✓ |
| `/trial` 发消息（DeepSeek） | ✗ | ✓（需 Key+余额） | ✗（应用 user JWT） |
| `/admin` CMS / 用户 / 钱包加额 | ✗ | ✗ | ✓ |
| 用 admin JWT 调 `/api/user/*` | — | — | ✗（禁止互冒） |
| 用 user JWT 调管理写接口 | — | ✗ | — |

**JWT 分离**：C 端 `role=user`（`404home_user_token`）；管理端 `role=admin`（`404home_admin_token`）。

## 4. 测试可用账号（约定）

### 4.1 guest

清站点数据或退出后使用。

### 4.2 user（SQLite `users`）

- 默认邮箱：`uat@404home.test`
- 默认密码：`Uat404Home!`（可用环境变量覆盖）
- Seed：服务启动时若不存在则创建（`seed.ensureUatUser`）
- Env（可选）：`UAT_USER_EMAIL`、`UAT_USER_PASSWORD`

### 4.3 admin（SQLite `admins`）

- 用户名 / 密码：`ADMIN_USERNAME` / `ADMIN_PASSWORD`（见 `server/.env`）
- 本地示例常见：`admin` / `admin123`
- **生产口令只写在服务器 `.env` 与本地 `uat.local.md` / `deploy.local.md`，不写进仓库**

## 5. 用户测试指导（评价轮）

### 5.0 准备

1. 打开目标环境入口（见 `uat.local.md`）。
2. 准备两窗口：无痕（guest）+ 已登录 user；需要时再开 `/admin`。
3. **默认评价轮跳过 DeepSeek**（不发 `/trial` 消息），除非评价表单独要求「试用计费」。

### 5.1 宿主 UX 清单（对齐 forty40 UX review）

打分建议：通过 / 部分 / 失败；备注可写截图时间。

| # | 场景 | 角色 | 步骤 | 期望 |
| --- | --- | --- | --- | --- |
| U1 | 加载不闪空 | guest | 硬刷新 `/` | 先 skeleton，勿先见「暂无文章/工具/热榜」 |
| U2 | 详情等待态 | guest | 打开 `/tool/chatgpt`、一篇 `/news/:id` | 有骨架；失败可重试 |
| U3 | 时间可信 | guest | 看文章卡时间 | 相对时间或日期，无整页同秒感 |
| U4 | 首屏叙事 | guest | 首屏不滚动 | 文案偏内容站；搜索标明「搜工具」；可见文章卡 |
| U5 | 移动顶栏 | guest 手机宽 | ≤820px | 登录在汉堡菜单内；分类有「更多」；首屏能见内容 |
| U6 | 热门不通胀 | guest | 看 Feed 徽章 / 侧栏 | 侧栏为「精选」；与主列表明显去重；热门工具区可不打「热门」徽标 |
| U7 | 工具可决策 | guest | `/tool/chatgpt` | 可见定价 / 地区 / 适合；相关对比≥2 时展示 |
| U8 | 搜索引导 | guest | `/search` 空词与乱词 | 可点热词/分类；0 结果仍有下一步 |
| U9 | 文章厚度 | guest | 打开任意热门文 | 正文可读（非只有标题摘要） |
| U10 | Trial 预览 | guest | `/trial` 未登录 | 示例气泡 + 额度说明 + 登录 CTA；**不要求真回复** |

### 5.2 账号与权限抽检（5 分钟）

| # | 步骤 | 期望 |
| --- | --- | --- |
| A1 | guest 打开 `/admin` | 需管理员登录，进不去 CMS |
| A2 | `uat@404home.test` 前台登录 | 成功；Header 显示邮箱 |
| A3 | 同 user 打开 `/admin` | 不能用 C 端身份管理后台 |
| A4 | admin 登录 `/admin` | 可见工具/文章/用户等管理 |
| A5 | （可选）admin 给 uat 用户加额 | 账本有记录，非静默改余额 |

### 5.3 DeepSeek 轮次（可选，默认跳过）

仅当评价「试用计费」时：

1. 确认生产/本地已配 `DEEPSEEK_API_KEY`（或本地 `DEEPSEEK_STUB=1` 仅开发）。
2. user 登录 → `/trial` → 发一条短消息。
3. 期望：有回复或明确错误码；余额 chip 变化符合账本。
4. guest 不得成功调用发消息 API。

## 6. 评价记录建议

复制到表格或问卷：

```text
环境：本地 / 生产 IP / 域名
日期：
评价人：
账号：guest | uat@… | admin
DeepSeek：未测 / 已测
U1–U10：各 通过|部分|失败 + 一句现象
总体：1–5 分
最想改的 1 件事：
```

## 7. Safeguards

- 真实口令只放 `uat.local.md` / 服务器 `.env`。
- 勿在评价文档或聊天里粘贴生产 SSH 密码。
- 生产改 UAT 用户密码后同步 `uat.local.md`。
- 评价轮误触 DeepSeek 产生费用时，用 admin 加额或停用 Key。

## 8. Enforcement

- Seed：`404home/server/seed.js` → `ensureUatUser`
- Env：`404home/server/.env.example` → `UAT_USER_*`
- 配置：`404home/uat.local*.md`
