# 测试条例 · ICP / 页脚合规悬挂

- Status: active
- Related ADR: `docs/spdd/2-adr决策/ADR-20261021-icp-compliance.md`
- Related boundary: `docs/spdd/3-测试边界/404home-icp-compliance.md`
- Related canvas: `docs/spdd/canvases/20261021-icp-compliance.md`
- Code tests: `404home/src/config/siteCompliance.spec.js`
- Updated: 2026-10-21

## Cases

### TC-01 · ICP 配置非空时可生成悬挂链接

- Priority: P0
- **Given**: `icpNumber` / `icpUrl` 已配置（生产值为粤 ICP 主体号）
- **When**: 读取合规配置的页脚链接描述
- **Then**: 返回非空 `text` 与 `href`（工信部），且 text 含「ICP」或「备」
- **Notes**:

### TC-02 · 公安号为空不输出公安链接

- Priority: P0
- **Given**: `policeNumber` 为空
- **When**: 生成公安链接描述
- **Then**: 为 `null` / 不渲染
- **Notes**:

### TC-03 · 公安号非空时输出链接

- Priority: P1
- **Given**: 临时设置公安号与 URL
- **When**: 生成公安链接描述
- **Then**: text/href 均非空
- **Notes**: 测完恢复空配置或仅测纯函数

## Traceability

| Case | Boundary | ADR |
| --- | --- | --- |
| TC-01 | 悬挂 ICP | §1–2 |
| TC-02–03 | 公安可选 | §4 |
