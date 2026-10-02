<template>
  <div class="page container">
    <div class="section-title">
      <h2>{{ category?.name || '分类' }}</h2>
      <RouterLink to="/">返回首页</RouterLink>
    </div>
    <p v-if="loading" class="empty">加载中...</p>
    <div v-else class="tool-grid">
      <ToolCard v-for="tool in tools" :key="tool.id" :tool="tool" />
      <p v-if="!tools.length" class="empty">该分类暂无工具</p>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import ToolCard from '@/components/ToolCard.vue'

export default {
  name: 'CategoryView',
  components: { ToolCard },
  setup() {
    const route = useRoute()
    const category = ref(null)
    const tools = ref([])
    const loading = ref(true)

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

    return { category, tools, loading }
  }
}
</script>
