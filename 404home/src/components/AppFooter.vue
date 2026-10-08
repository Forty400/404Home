<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div>
        <strong>404Home</strong>
        <p>收录常用 AI 工具，按场景分类，方便查找与持续更新。</p>
      </div>
      <div class="links">
        <RouterLink to="/about">关于我们</RouterLink>
        <RouterLink to="/news">每日资讯</RouterLink>
        <RouterLink to="/tutorials">教程资源</RouterLink>
        <RouterLink to="/admin">管理后台</RouterLink>
      </div>
      <p class="note">本站仅作工具导航与信息整理，不代表对第三方产品的背书。使用请遵守各工具官方条款。</p>
    </div>
  </footer>
</template>

<script>
export default { name: 'AppFooter' }
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  background: var(--bg-elevated-a70);
  padding: 36px 0 48px;
}

.footer-inner {
  display: grid;
  gap: 18px;
}

.footer p {
  margin: 8px 0 0;
  color: var(--ink-soft);
  line-height: 1.6;
  max-width: 52ch;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.links a {
  color: var(--accent);
}

.note {
  font-size: 0.86rem;
}
</style>
