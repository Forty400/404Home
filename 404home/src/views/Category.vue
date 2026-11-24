<template>
  <div class="page container">
    <div class="section-title">
      <h2>{{ category?.name || '分类' }}</h2>
      <RouterLink to="/">返回首页</RouterLink>
    </div>
    <div v-if="loading" class="skeleton-stack" aria-busy="true" aria-label="加载分类工具">
      <div class="skeleton skeleton-card" />
      <div class="skeleton skeleton-card" />
      <div class="skeleton skeleton-card" />
    </div>
    <div v-else class="tool-grid">
      <ToolCard v-for="tool in tools" :key="tool.id" :tool="tool" />
      <p v-if="phase === 'empty'" class="empty">该分类暂无工具</p>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import ToolCard from '@/components/ToolCard.vue'
import { listPhase } from '@/utils/listPhase'

export default {
  name: 'CategoryView',
  components: { ToolCard },
  setup() {
    const route = useRoute()
    const category = ref(null)
    const tools = ref([])
    const loading = ref(true)
    const phase = computed(() => listPhase(loading.value, tools.value.length))

    async function load() {
      loading.value = true
      try {
        const slug = route.params.slug
        category.value = await api.getCategory(slug)
        const res = await api.getTools({ category: slug, pageSize: 100 })
        tools.value = res.items
      } catch (e) {
        category.value = { name: '分类不存在' }
        tools.value = []
      } finally {
        loading.value = false
      }
    }

    onMounted(load)
    watch(() => route.params.slug, load)

    return { category, tools, loading, phase }
  }
}
</script>
