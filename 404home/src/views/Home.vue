<template>
  <div class="page">
    <section class="hero container">
      <p class="eyebrow">AI 内容站 · 工具可搜</p>
      <h1>404Home</h1>
      <p class="lead">热门 AI 文章与工具导航；DeepSeek 可试用。</p>
      <p class="hero-cta">
        <RouterLink class="cta-link" to="/trial">DeepSeek 试用</RouterLink>
      </p>
      <SearchBar />
      <div class="hint-row" aria-label="搜工具示例">
        <span class="hint-label">搜工具：</span>
        <button
          v-for="hint in searchHints"
          :key="hint"
          type="button"
          class="hint-chip"
          @click="goSearch(hint)"
        >
          {{ hint }}
        </button>
      </div>
      <div class="topic-tabs" role="tablist" aria-label="筛选文章">
        <button
          v-for="tab in topicTabs"
          :key="tab.value"
          type="button"
          role="tab"
          class="topic-tab"
          :class="{ active: topic === tab.value }"
          :aria-selected="topic === tab.value ? 'true' : 'false'"
          @click="topic = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </section>

    <div class="container home-grid">
      <div class="main-col">
        <section class="block">
          <div class="section-title">
            <h2>{{ feedTitle }}</h2>
            <span v-if="!loading" class="count">{{ feed.length }} 篇</span>
          </div>
          <div v-if="loading" class="skeleton-stack" aria-busy="true" aria-label="加载文章">
            <div class="skeleton skeleton-card" />
            <div class="skeleton skeleton-card" />
            <div class="skeleton skeleton-card" />
          </div>
          <div v-else class="article-list">
            <ArticleCard v-for="post in feed" :key="post.id" :post="post" />
            <p v-if="feedPhase === 'empty'" class="empty">该分类暂无文章</p>
          </div>
        </section>

        <section class="block">
          <div class="section-title">
            <h2>热门工具</h2>
          </div>
          <div v-if="loading" class="skeleton-stack" aria-busy="true" aria-label="加载工具">
            <div class="skeleton skeleton-card" />
            <div class="skeleton skeleton-card" />
          </div>
          <div v-else class="tool-grid">
            <ToolCard
              v-for="tool in hotTools"
              :key="tool.id"
              :tool="tool"
              :show-hot-badge="false"
            />
            <p v-if="toolsPhase === 'empty'" class="empty">暂无热门工具</p>
          </div>
        </section>
      </div>

      <aside class="side-col card-panel">
        <h3>精选</h3>
        <div v-if="loading" class="skeleton-stack" aria-busy="true" aria-label="加载精选">
          <div class="skeleton skeleton-line" />
          <div class="skeleton skeleton-line w60" />
          <div class="skeleton skeleton-line" />
          <div class="skeleton skeleton-line w60" />
        </div>
        <template v-else>
          <ol class="rank-list">
            <li v-for="(post, index) in featuredRank" :key="post.id">
              <span class="rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <RouterLink :to="detailPath(post)">{{ post.title }}</RouterLink>
            </li>
          </ol>
          <p v-if="rankPhase === 'empty'" class="empty">暂无精选</p>
        </template>
      </aside>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import SearchBar from '@/components/SearchBar.vue'
import ToolCard from '@/components/ToolCard.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { listPhase } from '@/utils/listPhase'
import { pickFeaturedRank } from '@/utils/pickFeaturedRank'
import { SEARCH_HINTS } from '@/utils/searchHints'

const TOPIC_TABS = [
  { value: '', label: '全部' },
  { value: 'plugin', label: 'AI 插件' },
  { value: 'dev', label: 'AI 开发' },
  { value: 'method', label: '方法论' },
  { value: 'news', label: 'AI 新闻' }
]

export default {
  name: 'HomeView',
  components: { SearchBar, ToolCard, ArticleCard },
  setup() {
    const router = useRouter()
    const topic = ref('')
    const allPosts = ref([])
    const hotTools = ref([])
    const loading = ref(true)
    const searchHints = SEARCH_HINTS
    const topicTabs = TOPIC_TABS

    const feed = computed(() => {
      if (!topic.value) return allPosts.value
      return allPosts.value.filter((p) => p.topic === topic.value)
    })

    const feedTitle = computed(() => {
      const tab = TOPIC_TABS.find((t) => t.value === topic.value)
      return tab && tab.value ? tab.label : '热门文章'
    })

    const featuredRank = computed(() =>
      pickFeaturedRank(allPosts.value, {
        excludeIds: feed.value.slice(0, 6).map((p) => p.id),
        limit: 8
      })
    )

    const feedPhase = computed(() => listPhase(loading.value, feed.value.length))
    const toolsPhase = computed(() => listPhase(loading.value, hotTools.value.length))
    const rankPhase = computed(() => listPhase(loading.value, featuredRank.value.length))

    function detailPath(post) {
      return post.type === 'tutorial' ? `/tutorials/${post.id}` : `/news/${post.id}`
    }

    function goSearch(q) {
      router.push({ name: 'search', query: { q } })
    }

    onMounted(async () => {
      loading.value = true
      try {
        const [posts, hot] = await Promise.all([
          api.getPosts({}),
          api.getTools({ hot: 1, pageSize: 8 })
        ])
        allPosts.value = posts
        hotTools.value = hot.items
      } catch (e) {
        console.error(e)
        allPosts.value = []
        hotTools.value = []
      } finally {
        loading.value = false
      }
    })

    return {
      topic,
      topicTabs,
      feed,
      feedTitle,
      featuredRank,
      hotTools,
      loading,
      feedPhase,
      toolsPhase,
      rankPhase,
      searchHints,
      detailPath,
      goSearch
    }
  }
}
</script>

<style scoped>
.hero {
  padding: 16px 0 8px;
  display: grid;
  gap: 8px;
  justify-items: start;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 600;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.9rem, 4.5vw, 2.8rem);
  line-height: 0.98;
  letter-spacing: -0.04em;
}

.lead {
  margin: 0;
  max-width: 48ch;
  color: var(--ink-soft);
  font-size: 0.95rem;
  line-height: 1.5;
}

.hero-cta {
  margin: 0;
}

.cta-link {
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
}

.cta-link:hover {
  text-decoration: underline;
}

.hint-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.hint-label {
  color: var(--ink-soft);
  font-size: 0.78rem;
}

.hint-chip {
  border: 1px solid var(--line);
  background: var(--bg-elevated);
  color: var(--ink-soft);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.78rem;
  cursor: pointer;
}

.hint-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.topic-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
}

.topic-tab {
  border: 1px solid var(--line);
  background: var(--bg-elevated);
  color: var(--ink-soft);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 0.84rem;
  cursor: pointer;
}

.topic-tab.active,
.topic-tab:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

.home-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 22px;
  align-items: start;
  margin-top: 12px;
}

.main-col {
  display: grid;
  gap: 28px;
}

.section-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title h2 {
  margin: 0;
  font-size: 1.2rem;
}

.count {
  color: var(--ink-soft);
  font-size: 0.85rem;
}

.article-list {
  display: grid;
  gap: 12px;
}

.side-col {
  position: sticky;
  top: 72px;
  padding: 16px 18px 18px;
}

.side-col h3 {
  margin: 0 0 12px;
  font-size: 1.05rem;
}

.rank-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.rank-list li {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  font-size: 0.9rem;
  line-height: 1.4;
}

.rank-list a {
  color: inherit;
  text-decoration: none;
}

.rank-list a:hover {
  color: var(--accent);
}

.rank {
  font-weight: 700;
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
}

.rank.top {
  color: var(--hot);
}

@media (max-width: 960px) {
  .home-grid {
    grid-template-columns: 1fr;
  }

  .side-col {
    position: static;
  }
}
</style>
