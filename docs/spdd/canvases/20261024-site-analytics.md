# REASONS Canvas · 站内访问量可视化

- Date: 2026-10-24
- Status: active
- Related analysis: （本期跳过独立 analysis，需求=交付 PV/UV 后台图）
- Related ADR: `ADR-20261024-site-analytics.md`

## R

后台可看网站访问量：今日/近7/近30 PV·UV、趋势图、热门路径；C 端自动上报。

## E

| Entity | Persistence |
| --- | --- |
| PageView | `page_views(path, visitor_id, created_at)` |

## A

自建埋点 + SVG 图表；扩展 Dashboard，不新开菜单。

## O

1. ADR + 边界/条例  
2. DB + P0 红测 → analytics + stats/traffic 绿  
3. C 端 `usePageview` + MainLayout/router  
4. Dashboard 卡片 + 趋势/Top  

## N

Koa 路由风格；错误码简短；测试 `node --test`。

## S

- 不写钱包/chat  
- pageview 接口无鉴权但校验 path 长度  
- admin 才读 traffic  
