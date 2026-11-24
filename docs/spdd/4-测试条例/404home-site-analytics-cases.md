# 测试条例 · 站内访问量

- Status: active
- Related ADR: `ADR-20261024-site-analytics.md`
- Code tests: `404home/server/test/analytics-p0.test.js`
- Updated: 2026-10-24

## Cases

### TC-01 · pageview records

- Priority: P0
- **Given**: 合法 path + visitorId
- **When**: `POST /api/analytics/pageview`
- **Then**: 200；`page_views` 多一行

### TC-02 · traffic aggregates

- Priority: P0
- **Given**: 若干 PV（不同 visitor / path）
- **When**: admin `GET /api/stats/traffic`
- **Then**: `today.pv/uv`、`days7`、`days30`、`daily[]`、`topPaths[]` 合理

### TC-03 · traffic admin only

- Priority: P0
- **Given**: user JWT 或无 token
- **When**: GET traffic
- **Then**: 401/403

### TC-04 · reject bad path

- Priority: P0
- **Given**: 空 path 或超长
- **When**: POST pageview
- **Then**: 400
