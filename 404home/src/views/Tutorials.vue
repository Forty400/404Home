<template>
  <div class="page container">
    <div class="section-title">
      <h2>教程资源</h2>
    </div>
    <div class="list">
      <article v-for="item in items" :key="item.id" class="card-panel item">
        <h3><RouterLink :to="`/tutorials/${item.id}`">{{ item.title }}</RouterLink></h3>
        <p>{{ item.summary }}</p>
        <time>{{ item.created_at }}</time>
      </article>
      <p v-if="!items.length" class="empty">暂无教程</p>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { api } from '@/api'

export default {
  name: 'TutorialsView',
  setup() {
    const items = ref([])
    onMounted(async () => {
      items.value = await api.getPosts({ type: 'tutorial' })
    })
    return { items }
  }
}
</script>

<style scoped>
.list {
  display: grid;
  gap: 14px;
}
.item {
  padding: 18px 20px;
}
h3 {
  margin: 0 0 8px;
  font-family: var(--font-display);
}
p {
  margin: 0;
  color: var(--ink-soft);
  line-height: 1.6;
}
time {
  display: inline-block;
  margin-top: 10px;
  font-size: 0.82rem;
  color: var(--ink-soft);
}
</style>
