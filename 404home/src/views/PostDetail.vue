<template>
  <div class="page container">
    <div v-if="loading" class="skeleton-stack" aria-busy="true" aria-label="加载文章">
      <div class="skeleton skeleton-detail" />
      <div class="skeleton skeleton-line" />
      <div class="skeleton skeleton-line w60" />
      <div class="skeleton skeleton-line" />
    </div>
    <article v-else-if="post" class="card-panel article">
      <p class="type">{{ topicLabel }}</p>
      <h1>{{ post.title }}</h1>
      <time>{{ relativeTime }}</time>
      <p class="summary">{{ post.summary }}</p>
      <p v-if="post.source_url" class="source">
        出处：
        <a :href="post.source_url" target="_blank" rel="noopener noreferrer">{{
          post.source_name || post.source_url
        }}</a>
      </p>
      <img
        v-if="post.cover"
        class="cover"
        :src="post.cover"
        :alt="post.title"
      />
      <div class="content">
        <template v-for="(block, i) in bodyBlocks" :key="i">
          <h2 v-if="block.type === 'h2'">{{ block.text }}</h2>
          <p v-else>{{ block.text }}</p>
        </template>
      </div>
      <section v-if="related.length" class="related" aria-label="相关文章">
        <h2>相关文章</h2>
        <ul>
          <li v-for="item in related" :key="item.id">
            <RouterLink :to="detailPath(item)">{{ item.title }}</RouterLink>
          </li>
        </ul>
      </section>
      <RouterLink class="back" to="/">返回首页</RouterLink>
    </article>
    <div v-else class="empty card-panel miss">
      <p>{{ loadError || '内容不存在' }}</p>
      <button class="btn btn-primary" type="button" @click="load">重试</button>
      <RouterLink class="btn btn-ghost" to="/">返回首页</RouterLink>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { parsePostBody } from '@/utils/parsePostBody'
import { pickRelatedPosts } from '@/utils/pickRelatedPosts'

const TOPIC_LABELS = {
  plugin: 'AI 插件',
  dev: 'AI 开发',
  method: 'AI 方法论',
  news: 'AI 新闻'
}

export default {
  name: 'PostDetailView',
  props: {
    postType: { type: String, default: 'news' }
  },
  setup() {
    const route = useRoute()
    const post = ref(null)
    const related = ref([])
    const loading = ref(true)
    const loadError = ref('')
    const topicLabel = computed(() => {
      if (!post.value) return ''
      return TOPIC_LABELS[post.value.topic] || (post.value.type === 'news' ? '资讯' : '教程')
    })
    const relativeTime = computed(() => formatRelativeTime(post.value?.created_at))
    const bodyBlocks = computed(() => parsePostBody(post.value?.content))

    function detailPath(p) {
      return p.type === 'tutorial' ? `/tutorials/${p.id}` : `/news/${p.id}`
    }

    async function load() {
      loading.value = true
      loadError.value = ''
      related.value = []
      try {
        post.value = await api.getPost(route.params.id)
        if (post.value?.title) {
          document.title = `${post.value.title} · 404Home`
        }
        if (post.value?.topic) {
          const list = await api.getPosts({ topic: post.value.topic })
          related.value = pickRelatedPosts(list, {
            excludeId: post.value.id,
            topic: post.value.topic,
            limit: 3
          })
        }
      } catch (e) {
        post.value = null
        loadError.value = e?.status === 404 ? '' : '加载失败，请重试'
      } finally {
        loading.value = false
      }
    }

    onMounted(load)
    watch(() => route.params.id, load)

    return {
      post,
      related,
      loading,
      loadError,
      topicLabel,
      relativeTime,
      bodyBlocks,
      detailPath,
      load
    }
  }
}
</script>

<style scoped>
.article {
  padding: 28px;
  max-width: 760px;
}
.type {
  margin: 0;
  color: var(--accent);
  font-size: 0.84rem;
  font-weight: 600;
}
h1 {
  margin: 8px 0 10px;
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  line-height: 1.25;
}
time {
  color: var(--ink-soft);
  font-size: 0.85rem;
}
.summary {
  margin: 16px 0 8px;
  color: var(--ink-soft);
  line-height: 1.6;
}
.source {
  margin: 0 0 16px;
  font-size: 0.9rem;
  color: var(--ink-soft);
}
.source a {
  color: var(--accent);
}
.cover {
  display: block;
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 18px;
  border: 1px solid var(--line);
}
.content {
  line-height: 1.75;
}
.content h2 {
  margin: 1.4em 0 0.55em;
  font-family: var(--font-display);
  font-size: 1.2rem;
  line-height: 1.35;
}
.content p {
  margin: 0 0 1em;
  white-space: pre-wrap;
}
.related {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}
.related h2 {
  margin: 0 0 10px;
  font-size: 1.05rem;
  font-family: var(--font-display);
}
.related ul {
  margin: 0;
  padding-left: 1.2em;
  color: var(--ink-soft);
}
.related a {
  color: var(--accent);
}
.back {
  display: inline-block;
  margin-top: 24px;
  color: var(--accent);
}
.miss {
  padding: 28px;
  display: grid;
  gap: 14px;
  justify-items: start;
  max-width: 520px;
}
</style>
