<template>
  <div class="page container">
    <p v-if="loading" class="empty">加载中...</p>
    <template v-else-if="tool">
      <article class="card-panel detail">
        <div class="head">
          <div class="icon" aria-hidden="true">{{ initials }}</div>
          <div>
            <p class="eyebrow" v-if="tool.category_name">{{ tool.category_name }}</p>
            <h1>
              {{ tool.name }}
              <span v-if="tool.is_hot" class="badge badge-hot">热门</span>
              <span v-if="tool.is_new" class="badge badge-new">新</span>
            </h1>
          </div>
        </div>
        <p class="summary">{{ tool.summary }}</p>
        <div class="tags" v-if="tool.tags && tool.tags.length">
          <span v-for="tag in tool.tags" :key="tag">{{ tag }}</span>
        </div>
        <div class="actions">
          <a
            class="btn btn-primary"
            :href="tool.url"
            target="_blank"
            rel="noopener noreferrer"
          >访问官网</a>
          <RouterLink
            v-if="tool.category_slug"
            class="btn btn-ghost"
            :to="`/category/${tool.category_slug}`"
          >查看分类</RouterLink>
          <RouterLink class="btn btn-ghost" to="/">返回首页</RouterLink>
        </div>
      </article>
      <section v-if="related.length" class="related">
        <div class="section-title">
          <h2>相关工具</h2>
          <RouterLink v-if="tool.category_slug" :to="`/category/${tool.category_slug}`">查看更多</RouterLink>
        </div>
        <div class="tool-grid">
          <ToolCard v-for="item in related" :key="item.id" :tool="item" />
        </div>
      </section>
    </template>
    <div v-else class="empty card-panel miss">
      <p>工具不存在或已下线</p>
      <RouterLink class="btn btn-primary" to="/">返回首页</RouterLink>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import ToolCard from '@/components/ToolCard.vue'

export default {
  name: 'ToolDetailView',
  components: { ToolCard },
  setup() {
    const route = useRoute()
    const tool = ref(null)
    const related = ref([])
    const loading = ref(true)

    const initials = computed(() => (tool.value?.name || '?').slice(0, 1).toUpperCase())

    async function loadRelated(current) {
      related.value = []
      if (!current?.category_slug) return
      try {
        const res = await api.getTools({
          category: current.category_slug,
          pageSize: 8
        })
        related.value = (res.items || [])
          .filter((item) => item.slug !== current.slug)
          .slice(0, 6)
      } catch {
        related.value = []
      }
    }

    async function load() {
      loading.value = true
      tool.value = null
      related.value = []
      try {
        tool.value = await api.getTool(route.params.slug)
        await loadRelated(tool.value)
      } catch {
        tool.value = null
      } finally {
        loading.value = false
      }
    }

    onMounted(load)
    watch(() => route.params.slug, load)

    return { tool, related, loading, initials }
  }
}
</script>

<style scoped>
.detail {
  padding: 28px;
  max-width: 720px;
}
.related {
  margin-top: 28px;
}
.head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  flex: 0 0 auto;
}
.eyebrow {
  margin: 0 0 6px;
  color: var(--accent);
  font-size: 0.84rem;
  font-weight: 600;
}
h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.summary {
  margin: 0 0 16px;
  color: var(--ink-soft);
  line-height: 1.7;
  font-size: 1.02rem;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}
.tags span {
  font-size: 0.78rem;
  color: var(--ink-soft);
  background: rgba(28, 43, 36, 0.05);
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.miss {
  padding: 28px;
  display: grid;
  gap: 14px;
  justify-items: start;
  max-width: 520px;
}
</style>
