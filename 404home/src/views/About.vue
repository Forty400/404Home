<template>
  <div class="page container">
    <article class="card-panel about">
      <h1>关于 404Home</h1>
      <p>
        404Home 是一个 AI 工具收录与导航站点，目标是把常用的写作、图像、视频、办公、编程、搜索等 AI 工具整理到一处，方便按场景查找。
      </p>
      <p>
        站点内容可通过管理后台持续维护。工具信息来自公开资料整理，跳转后请以各产品官方说明为准。
      </p>
      <p>
        灵感参考了 AI 工具导航类网站的分类组织方式，视觉与内容为 404Home 独立实现。
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
p {
  margin: 0 0 12px;
  color: var(--ink-soft);
  line-height: 1.7;
}
</style>
