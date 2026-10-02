<template>
  <div class="page container">
    <div class="section-title">
      <h2>搜索结果</h2>
    </div>
    <SearchBar v-model="q" />
    <p class="hint" v-if="q">关键词：「{{ q }}」 · 共 {{ tools.length }} 个结果</p>
    <div class="tool-grid" style="margin-top: 18px">
      <ToolCard v-for="tool in tools" :key="tool.id" :tool="tool" />
      <p v-if="!loading && !tools.length" class="empty">没有找到相关工具</p>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import SearchBar from '@/components/SearchBar.vue'
import ToolCard from '@/components/ToolCard.vue'

export default {
  name: 'SearchView',
  components: { SearchBar, ToolCard },
  setup() {
    const route = useRoute()
    const q = ref('')
    const tools = ref([])
    const loading = ref(false)

    async function load() {
      q.value = String(route.query.q || '')
      if (!q.value) {
        tools.value = []
        return
      }
      loading.value = true
      try {
        const res = await api.getTools({ q: q.value, pageSize: 100 })
        tools.value = res.items
      } finally {
        loading.value = false
      }
    }

    onMounted(load)
    watch(() => route.query.q, load)

    return { q, tools, loading }
  }
}
</script>

<style scoped>
.hint {
  margin: 14px 0 0;
  color: var(--ink-soft);
}
</style>
