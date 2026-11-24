<template>
  <div class="page container">
    <div class="section-title">
      <h2>智能检索</h2>
      <p class="sub">双路召回 + RRF + LLM 精排 · 展示 top-5 与命中理由</p>
    </div>

    <form class="search-row" @submit.prevent="run">
      <input
        v-model="q"
        type="search"
        class="input"
        placeholder="例如：适合做海报的免费 AI"
        aria-label="智能检索查询"
      />
      <button type="submit" class="btn" :disabled="loading">{{ loading ? '检索中…' : '检索' }}</button>
    </form>

    <p class="hint">
      <RouterLink to="/search">关键词搜索</RouterLink>
      仍可用 · 本页为 RAG 演示
    </p>

    <p v-if="metaLine" class="meta">{{ metaLine }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="loading" class="skeleton-stack" style="margin-top: 18px" aria-busy="true">
      <div class="skeleton skeleton-card" />
      <div class="skeleton skeleton-card" />
    </div>

    <ul v-else class="result-list">
      <li v-for="item in items" :key="item.tool.id" class="result-card">
        <div class="rank">#{{ item.rank }}</div>
        <div class="body">
          <RouterLink class="name" :to="`/tool/${item.tool.slug}`">{{ item.tool.name }}</RouterLink>
          <p class="summary">{{ item.tool.summary }}</p>
          <p class="reason">{{ item.reason }}</p>
        </div>
        <div class="score">{{ Number(item.score).toFixed(3) }}</div>
      </li>
    </ul>

    <p v-if="!loading && searched && !items.length && !error" class="empty">没有命中，换个说法试试</p>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { api } from '@/api'

export default {
  name: 'SmartSearchView',
  setup() {
    const q = ref('适合做海报的免费 AI')
    const items = ref([])
    const meta = ref(null)
    const loading = ref(false)
    const error = ref('')
    const searched = ref(false)

    const metaLine = computed(() => {
      if (!meta.value) return ''
      const m = meta.value
      return `候选 RRF ${m.rrfCandidates || 0} · 关键词 ${m.keywordHits || 0} · 向量 ${m.vectorHits || 0}${
        m.degraded ? ' · 已降级' : ''
      }`
    })

    async function run() {
      error.value = ''
      loading.value = true
      searched.value = true
      try {
        const res = await api.smartSearch({ q: q.value, rerank: true })
        items.value = res.items || []
        meta.value = res.meta || null
      } catch (e) {
        items.value = []
        meta.value = null
        error.value = e.data?.code ? `${e.message} (${e.data.code})` : e.message || '检索失败'
      } finally {
        loading.value = false
      }
    }

    return { q, items, meta, metaLine, loading, error, searched, run }
  }
}
</script>

<style scoped>
.sub {
  margin: 6px 0 0;
  color: var(--ink-soft);
  font-size: 0.95rem;
}
.search-row {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}
.input {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
}
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.hint {
  margin: 10px 0 0;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.meta {
  margin: 12px 0 0;
  color: var(--ink-soft);
  font-size: 0.85rem;
}
.error {
  margin-top: 12px;
  color: #b91c1c;
}
.result-list {
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.result-card {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
}
.rank {
  font-weight: 700;
  color: var(--accent);
}
.name {
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
}
.summary {
  margin: 4px 0 0;
  color: var(--ink-soft);
  font-size: 0.92rem;
}
.reason {
  margin: 8px 0 0;
  font-size: 0.9rem;
  color: var(--ink);
}
.score {
  font-variant-numeric: tabular-nums;
  color: var(--ink-soft);
  font-size: 0.85rem;
}
.empty {
  margin-top: 24px;
  color: var(--ink-soft);
  text-align: center;
}
@media (max-width: 640px) {
  .search-row {
    flex-direction: column;
  }
  .result-card {
    grid-template-columns: 32px 1fr;
  }
  .score {
    grid-column: 2;
  }
}
</style>
