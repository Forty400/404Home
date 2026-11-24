<template>
  <div class="page container">
    <div class="section-title">
      <h2>每日资讯</h2>
    </div>
    <div v-if="phase === 'loading'" class="skeleton-stack" aria-busy="true" aria-label="加载资讯">
      <div class="skeleton skeleton-card" />
      <div class="skeleton skeleton-card" />
    </div>
    <div v-else class="list">
      <article v-for="item in items" :key="item.id" class="card-panel item">
        <h3><RouterLink :to="`/news/${item.id}`">{{ item.title }}</RouterLink></h3>
        <p>{{ item.summary }}</p>
        <time>{{ item.created_at }}</time>
      </article>
      <p v-if="phase === 'empty'" class="empty">暂无资讯</p>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api'
import { listPhase } from '@/utils/listPhase'

export default {
  name: 'NewsView',
  setup() {
    const items = ref([])
    const loading = ref(true)
    const phase = computed(() => listPhase(loading.value, items.value.length))

    onMounted(async () => {
      loading.value = true
      try {
        items.value = await api.getPosts({ type: 'news' })
      } catch {
        items.value = []
      } finally {
        loading.value = false
      }
    })
    return { items, phase }
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
