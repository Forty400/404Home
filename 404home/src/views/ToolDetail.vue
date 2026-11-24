<template>
  <div class="page container">
    <div v-if="loading" class="skeleton-stack" aria-busy="true" aria-label="加载工具详情">
      <div class="skeleton skeleton-detail" />
      <div class="skeleton skeleton-line" />
      <div class="skeleton skeleton-line w60" />
    </div>
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
        <dl v-if="hasDecision" class="decision">
          <div v-if="tool.pricing">
            <dt>定价</dt>
            <dd>{{ tool.pricing }}</dd>
          </div>
          <div v-if="tool.region_avail">
            <dt>地区</dt>
            <dd>{{ tool.region_avail }}</dd>
          </div>
          <div v-if="tool.scenario">
            <dt>适合</dt>
            <dd>{{ tool.scenario }}</dd>
          </div>
        </dl>
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
      <section v-if="related.length >= 2" class="related">
        <div class="section-title">
          <h2>对比相关工具</h2>
          <RouterLink v-if="tool.category_slug" :to="`/category/${tool.category_slug}`">查看更多</RouterLink>
        </div>
        <div class="tool-grid">
          <ToolCard v-for="item in related" :key="item.id" :tool="item" />
        </div>
      </section>
    </template>
    <div v-else class="empty card-panel miss">
      <p>{{ loadError || '工具不存在或已下线' }}</p>
      <button class="btn btn-primary" type="button" @click="load">重试</button>
      <RouterLink class="btn btn-ghost" to="/">返回首页</RouterLink>
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
    const loadError = ref('')

    const initials = computed(() => (tool.value?.name || '?').slice(0, 1).toUpperCase())
    const hasDecision = computed(() => {
      const t = tool.value
      return !!(t && (t.pricing || t.region_avail || t.scenario))
    })

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
      loadError.value = ''
      try {
        tool.value = await api.getTool(route.params.slug)
        if (tool.value?.name) {
          document.title = `${tool.value.name} · 404Home`
        }
        await loadRelated(tool.value)
      } catch (e) {
        tool.value = null
        loadError.value = e?.status === 404 ? '' : '加载失败，请重试'
      } finally {
        loading.value = false
      }
    }

    onMounted(load)
    watch(() => route.params.slug, load)

    return { tool, related, loading, loadError, initials, hasDecision, load }
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
.decision {
  margin: 0 0 16px;
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 4%, var(--bg-elevated));
}
.decision > div {
  display: grid;
  grid-template-columns: 3.5rem 1fr;
  gap: 8px;
  font-size: 0.9rem;
}
.decision dt {
  margin: 0;
  color: var(--ink-soft);
  font-weight: 600;
}
.decision dd {
  margin: 0;
  color: var(--ink);
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
  background: color-mix(in srgb, var(--ink) 5%, transparent);
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
