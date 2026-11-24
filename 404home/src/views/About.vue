<template>
  <div class="page container">
    <article class="card-panel about">
      <h1>关于 404Home</h1>
      <p class="lead">
        可审查的<strong>计费型 AI 试用</strong> + <strong>工具智能检索</strong>，挂在 AI 内容 / 导航宿主上——面向作品集与面试可深挖，而不是「调过一次 ChatGPT」。
      </p>

      <h2>演示入口</h2>
      <div class="actions">
        <router-link class="btn btn-primary" to="/trial">DeepSeek 试用（SSE 流式）</router-link>
        <router-link class="btn" to="/smart-search">工具智能检索</router-link>
      </div>

      <h2>技术亮点</h2>
      <ul class="highlights">
        <li>
          <strong>流式计费对话</strong>
          ——服务端 SSE 增量输出，结束后按 usage 走账本扣费；Key 永不进前端。
        </li>
        <li>
          <strong>工具 RAG + MCP</strong>
          ——双路召回 + RRF + LLM 精排；评测脚本与 MCP 工具可指到文件。
        </li>
        <li>
          <strong>双角色 JWT 与账本用分</strong>
          ——user / admin 分离；改余额必须经 wallet_ledger，禁止裸改。
        </li>
      </ul>

      <h2>内容与宿主</h2>
      <p>
        首页以热门文章为主（插件 / 开发 / 方法论 / 新闻），站内可读全文并注明出处；工具与文章均可经管理后台维护。
      </p>

      <p class="non-goal">
        <strong>非目标（本窗口）</strong>：不做 ChatBI、Multi-Agent、在线支付 / 微信登录。
      </p>
    </article>
  </div>
</template>

<script>
export default { name: 'AboutView' }
</script>

<style scoped>
.about {
  padding: 28px;
  max-width: 720px;
}
h1 {
  margin: 0 0 14px;
  font-family: var(--font-display);
}
h2 {
  margin: 22px 0 10px;
  font-size: 1.05rem;
  font-family: var(--font-display);
}
.lead,
p {
  margin: 0 0 12px;
  color: var(--ink-soft);
  line-height: 1.7;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 8px;
}
.highlights {
  margin: 0 0 12px;
  padding-left: 1.2em;
  color: var(--ink-soft);
  line-height: 1.7;
}
.highlights li {
  margin-bottom: 8px;
}
.non-goal {
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid var(--line, rgba(0, 0, 0, 0.08));
}
</style>
