# 测试边界 · SPDD 内容系列

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261024-spdd-content-series.md`
- Related canvas: `docs/spdd/canvases/20261024-spdd-content-series.md`
- Related cases: `docs/spdd/4-测试条例/404home-spdd-content-cases.md`
- Updated: 2026-10-24

## 测什么

- seed 是否幂等插入两篇 SPDD 系列标题，且正文厚度达标
- 热门配额在「新 id 优先」下仍每 topic ≤3，且新系列至少一篇为 hot
- `parsePostBody` 对 `##` 与段落的切分
- `pickRelatedPosts` 同 topic、排除自身、limit
- About 文案是否含内容站 + 试用语义（静态字符串断言即可）

## 不测什么

- Markdown 全语法、XSS 消毒产品化
- 管理后台富文本编辑器
- 线上已有库的手工迁移脚本（依赖 API 重启 seed）

## 风险面

- 热门排序改 DESC 可能让旧精品暂时非热门（配额用例仍锁上限）
- 长文 seed 体积增大，勿把二进制/密钥塞进 content
