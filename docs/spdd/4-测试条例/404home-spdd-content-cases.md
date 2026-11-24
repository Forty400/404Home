# 测试条例 · SPDD 内容系列

- Status: active
- Related boundary: `docs/spdd/3-测试边界/404home-spdd-content.md`
- Related canvas: `docs/spdd/canvases/20261024-spdd-content-series.md`
- Code tests: `404home/server/test/spdd-content-p0.test.js` · `404home/src/utils/parsePostBody.spec.js` · `pickRelatedPosts.spec.js`
- Updated: 2026-10-24

## Cases

### TC-01 · seed 含 SPDD 系列标题

- Priority: P0
- **Given**: 跑完 `seed()`
- **When**: 查已发布 posts 标题
- **Then**: 含「SPDD 规划指导手册」与「仓库 SPDD 化教程」；二者 `topic=method`、`content` 长度 ≥800、`source_url` 非空

### TC-02 · 新稿可占 method 热门

- Priority: P0
- **Given**: seed 后
- **When**: 查 `topic=method AND is_hot=1`
- **Then**: 数量 ≤3；至少一篇标题属于 TC-01 两篇之一

### TC-03 · parsePostBody

- Priority: P0
- **Given**: 文本含 `## 标题` 与空行分段
- **When**: `parsePostBody(text)`
- **Then**: 产出 `h2` + `p` 块；无空块

### TC-04 · pickRelatedPosts

- Priority: P0
- **Given**: 同 topic 多篇 + 异 topic 一篇
- **When**: `pickRelatedPosts(list, { excludeId, topic, limit:3 })`
- **Then**: 不含 excludeId；仅同 topic；长度 ≤3

### TC-05 · About 叙事

- Priority: P1
- **Given**: `About.vue` 源码
- **When**: 读取模板文案
- **Then**: 同时出现「文章」（或「内容」）与「试用」字样

## Traceability

| Case | 决策点 |
| --- | --- |
| TC-01/02 | ADR 内容 + 热门 DESC |
| TC-03/04 | 阅读 UX |
| TC-05 | UX-35 |
