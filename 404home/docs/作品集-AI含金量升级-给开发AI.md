# 给项目侧 AI · 从这里开始

把下面文件 **全文** 作为任务契约执行（推荐直接打开或粘贴）：

**主说明书（必读）**  
[`../../docs/spdd/canvases/20261109-portfolio-ai-highlights-HANDOFF.md`](../../docs/spdd/canvases/20261109-portfolio-ai-highlights-HANDOFF.md)

**配套契约**

| 文件 | 用途 |
| --- | --- |
| [`../../docs/spdd/2-adr决策/ADR-20261109-trial-sse-llm-adapter.md`](../../docs/spdd/2-adr决策/ADR-20261109-trial-sse-llm-adapter.md) | 局部解冻决策 |
| [`../../docs/spdd/canvases/20261109-trial-sse-llm-adapter.md`](../../docs/spdd/canvases/20261109-trial-sse-llm-adapter.md) | REASONS 画布 |
| [`../../docs/spdd/analysis/20261109-portfolio-ai-highlights.md`](../../docs/spdd/analysis/20261109-portfolio-ai-highlights.md) | 为何做、非目标 |
| [`../../docs/spdd/4-测试条例/404home-deepseek-chat-cases.md`](../../docs/spdd/4-测试条例/404home-deepseek-chat-cases.md) | TC-07…流式条例 |

## 启动提示（可复制）

```text
请严格按 E:\AAAproject\AI_SPACE\docs\spdd\canvases\20261109-portfolio-ai-highlights-HANDOFF.md 全文执行。
先读 ADR-20261109，再按 HANDOFF §7 顺序：先补 chat-stream-p0 红灯测试，再实现 SSE + llm 适配层，再 About/README。
禁止 Multi-Agent/ChatBI/换栈。每完成一步跑 npm test 并汇报。
```
