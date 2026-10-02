# Analysis · 工具站内详情页

- Date: 2026-10-02
- Author: SPDD first cycle
- Status: ready
- Related canvas: `docs/spdd/canvases/20261002-tool-detail.md`

## 1. Problem

当前卡片只有外链「访问」，用户无法在站内先看清工具简介、分类、标签再决定跳转；也不利于后续 SEO / 分享单页。

## 2. Goals / Non-goals

**Goals**

- 提供 `/tool/:slug` 站内详情页，展示名称、摘要、标签、分类、热门/新标记与官网入口。
- 列表卡片可进入详情；详情页可一键打开外链。
- 404 / 禁用工具有明确空态。

**Non-goals**

- 不新增评论、评分、收藏。
- 不改后台字段模型（不新增长文 content 列）。
- 不做 SSR / SEO 专项（本轮保持 SPA）。

## 3. Users & Scenarios

| Actor | Scenario | Success |
| --- | --- | --- |
| 访客 | 首页点工具名进入详情 | 看到介绍并可跳转官网 |
| 访客 | 直接打开错误 slug | 看到「工具不存在」与返回入口 |
| 运营 | 后台改简介后刷新详情 | 展示最新数据（已有 API） |

## 4. Constraints

- Tech: 复用 `GET /api/tools/:idOrSlug`；Vue Router 子路由。
- UI: 延续纸感浅绿风格。
- Ops: 仅前端构建变更为主，后端接口已存在。

## 5. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| slug 与 id 混用 | 链接不稳定 | 路由只用 slug；API 已支持二者 |
| 卡片误触外链 | 跳过详情 | 主点击进详情，「访问」仍外链 |

## 6. Open Questions

- [x] 是否需要正文长描述？→ 本轮否，仅用 summary。

## 7. Recommended Next

→ 生成 REASONS Canvas：`docs/spdd/canvases/20261002-tool-detail.md`
