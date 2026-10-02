<template>
  <div>
    <h1>概览</h1>
    <div class="stats">
      <div class="card-panel stat" v-for="item in cards" :key="item.label">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api'

export default {
  name: 'AdminDashboard',
  setup() {
    const stats = ref({
      tools: 0,
      categories: 0,
      news: 0,
      tutorials: 0,
      hotTools: 0
    })

    const cards = computed(() => [
      { label: '工具', value: stats.value.tools },
      { label: '分类', value: stats.value.categories },
      { label: '资讯', value: stats.value.news },
      { label: '教程', value: stats.value.tutorials },
      { label: '热门工具', value: stats.value.hotTools }
    ])

    onMounted(async () => {
      stats.value = await api.getStats()
    })

    return { cards }
  }
}
</script>

<style scoped>
h1 {
  margin: 0 0 18px;
  font-family: var(--font-display);
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}
.stat {
  padding: 18px;
  display: grid;
  gap: 6px;
}
.stat strong {
  font-size: 1.6rem;
  font-family: var(--font-display);
}
.stat span {
  color: var(--ink-soft);
  font-size: 0.9rem;
}
</style>
