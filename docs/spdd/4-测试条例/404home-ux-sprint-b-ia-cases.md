# 测试条例 · UX Sprint B（IA）

- Status: active
- Related boundary: `docs/spdd/3-测试边界/404home-ux-sprint-b-ia.md`
- Related canvas: `docs/spdd/canvases/20261021-ux-sprint-b-ia.md`
- Code tests: `404home/src/utils/shouldShowCategoryNav.spec.js` · `documentTitle.spec.js`
- Updated: 2026-10-21

## Cases

### TC-01 · 工具发现路由显示分类条

- Priority: P0
- **Given**: routeName ∈ home, category, search, tool-detail；navOpen=false
- **When**: `shouldShowCategoryNav(name, { navOpen: false })`
- **Then**: true

### TC-02 · 内容/试用路由隐藏

- Priority: P0
- **Given**: news, news-detail, tutorials, tutorial-detail, about, trial
- **When**: 同上
- **Then**: false

### TC-03 · 汉堡打开强制隐藏

- Priority: P0
- **Given**: home + navOpen=true
- **When**: `shouldShowCategoryNav('home', { navOpen: true })`
- **Then**: false

### TC-04 · document.title 解析

- Priority: P0
- **Given**: `{ name:'news', meta:{ title:'每日资讯' } }` 与 home / trial
- **When**: `resolveDocumentTitle(...)`
- **Then**: 含对应中文名并以 ` · 404Home` 结尾；无 meta 时有合理默认

### TC-05 · Hero 无说明书腔（源码）

- Priority: P0
- **Given**: `Home.vue` 源文件
- **When**: 扫描 lead 文案
- **Then**: 不含「先读热门文章」；含试用相关入口（`/trial` 或「试用」）

## Traceability

| Case | UX |
| --- | --- |
| TC-01/02 | UX-26 |
| TC-03 | UX-27 |
| TC-04 | UX-29 |
| TC-05 | UX-28 |
| （News listPhase 接线） | UX-30 |
