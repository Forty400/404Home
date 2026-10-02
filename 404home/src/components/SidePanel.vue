<template>
  <aside class="sidebar card-panel">
    <section>
      <h3>每日资讯</h3>
      <ul>
        <li v-for="item in news" :key="item.id">
          <RouterLink :to="`/news/${item.id}`">{{ item.title }}</RouterLink>
        </li>
        <li v-if="!news.length" class="muted">暂无资讯</li>
      </ul>
    </section>
    <section>
      <h3>教程资源</h3>
      <ul>
        <li v-for="item in tutorials" :key="item.id">
          <RouterLink :to="`/tutorials/${item.id}`">{{ item.title }}</RouterLink>
        </li>
        <li v-if="!tutorials.length" class="muted">暂无教程</li>
      </ul>
    </section>
  </aside>
</template>

<script>
export default {
  name: 'SidePanel',
  props: {
    news: { type: Array, default: () => [] },
    tutorials: { type: Array, default: () => [] }
  }
}
</script>

<style scoped>
.sidebar {
  padding: 18px;
  display: grid;
  gap: 22px;
  position: sticky;
  top: 120px;
}

h3 {
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-size: 1.05rem;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

li a {
  color: var(--ink);
  line-height: 1.45;
  font-size: 0.9rem;
}

li a:hover {
  color: var(--accent);
}

.muted {
  color: var(--ink-soft);
  font-size: 0.88rem;
}
</style>
