<template>
  <div class="page container">
    <div class="section-title">
      <h2>搜索工具</h2>
    </div>
    <SearchBar v-model="q" />
    <div class="guides">
      <p class="guide-label">试试：</p>
      <button
        v-for="hint in hints"
        :key="hint"
        type="button"
        class="hint-chip"
        @click="goHint(hint)"
      >
        {{ hint }}
      </button>
    </div>
    <div class="guides">
      <p class="guide-label">分类：</p>
      <RouterLink
        v-for="cat in categoryHints"
        :key="cat.slug"
        class="hint-chip link"
        :to="`/category/${cat.slug}`"
      >
        {{ cat.label }}
      </RouterLink>
    </div>

    <p class="hint" v-if="q && !loading">关键词：「{{ q }}」 · 共 {{ tools.length }} 个结果</p>

    <div v-if="loading" class="skeleton-stack" style="margin-top: 18px" aria-busy="true" aria-label="搜索中">
      <div class="skeleton skeleton-card" />
      <div class="skeleton skeleton-card" />
      <div class="skeleton skeleton-card" />
    </div>
    <div v-else class="tool-grid" style="margin-top: 18px">
      <ToolCard v-for="tool in tools" :key="tool.id" :tool="tool" />
      <div v-if="phase === 'empty'" class="empty-box">
        <p class="empty">{{ q ? '没有找到相关工具' : '输入关键词，或点上方热词 / 分类开始' }}</p>
        <p v-if="q" class="scope-note">搜索仅覆盖 AI 工具，不含文章正文。</p>
        <div v-if="relatedPosts.length" class="related-posts">
          <p class="guide-label">相关文章：</p>
          <RouterLink
            v-for="post in relatedPosts"
            :key="post.id"
            class="post-link"
            :to="postLink(post)"
          >
            {{ post.title }}
          </RouterLink>
        </div>
        <div v-if="q" class="guides center">
          <button
            v-for="hint in hints"
            :key="'e-' + hint"
            type="button"
            class="hint-chip"
            @click="goHint(hint)"
          >
            {{ hint }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api'
import SearchBar from '@/components/SearchBar.vue'
import ToolCard from '@/components/ToolCard.vue'
import { listPhase } from '@/utils/listPhase'
import { matchPostsByQuery } from '@/utils/matchPostsByQuery'
import { SEARCH_CATEGORY_HINTS, SEARCH_HINTS } from '@/utils/searchHints'

export default {
  name: 'SearchView',
  components: { SearchBar, ToolCard },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const q = ref('')
    const tools = ref([])
    const relatedPosts = ref([])
    const loading = ref(false)
    const hints = SEARCH_HINTS
    const categoryHints = SEARCH_CATEGORY_HINTS
    const phase = computed(() => listPhase(loading.value, tools.value.length))

    function goHint(word) {
      router.push({ name: 'search', query: { q: word } })
    }

    function postLink(post) {
      return post.type === 'tutorial' ? `/tutorials/${post.id}` : `/news/${post.id}`
    }

    async function load() {
      q.value = String(route.query.q || '')
      relatedPosts.value = []
      if (!q.value) {
        tools.value = []
        loading.value = false
        return
      }
      loading.value = true
      try {
        const res = await api.getTools({ q: q.value, pageSize: 100 })
        tools.value = res.items
        if (!tools.value.length) {
          const posts = await api.getPosts()
          relatedPosts.value = matchPostsByQuery(posts, q.value, 5)
        }
      } catch {
        tools.value = []
        relatedPosts.value = []
      } finally {
        loading.value = false
      }
    }

    onMounted(load)
    watch(() => route.query.q, load)

    return {
      q,
      tools,
      relatedPosts,
      loading,
      phase,
      hints,
      categoryHints,
      goHint,
      postLink
    }
  }
}
</script>

<style scoped>
.hint {
  margin: 14px 0 0;
  color: var(--ink-soft);
}
.guides {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}
.guides.center {
  justify-content: center;
  margin-top: 10px;
}
.guide-label {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.85rem;
}
.hint-chip {
  border: 1px solid var(--line);
  background: var(--bg-elevated);
  color: var(--ink-soft);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 0.82rem;
  cursor: pointer;
  text-decoration: none;
}
.hint-chip:hover,
.hint-chip.link.router-link-active {
  border-color: var(--accent);
  color: var(--accent);
}
.empty-box {
  grid-column: 1 / -1;
}
.scope-note {
  margin: 8px 0 0;
  color: var(--ink-soft);
  font-size: 0.85rem;
}
.related-posts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
  text-align: left;
}
.post-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.95rem;
  line-height: 1.4;
}
.post-link:hover {
  text-decoration: underline;
}
</style>
