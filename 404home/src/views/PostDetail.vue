<template>
  <div class="page container">
    <p v-if="loading" class="empty">加载中...</p>
    <article v-else-if="post" class="card-panel article">
      <p class="type">{{ post.type === 'news' ? '资讯' : '教程' }}</p>
      <h1>{{ post.title }}</h1>
      <time>{{ post.created_at }}</time>
      <p class="summary">{{ post.summary }}</p>
      <div class="content">{{ post.content }}</div>
      <RouterLink class="back" :to="post.type === 'news' ? '/news' : '/tutorials'">返回列表</RouterLink>
    </article>
    <p v-else class="empty">内容不存在</p>
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'

export default {
  name: 'PostDetailView',
  props: {
    postType: { type: String, default: 'news' }
  },
  setup() {
    const route = useRoute()
    const post = ref(null)
    const loading = ref(true)

    async function load() {
      loading.value = true
      try {
        post.value = await api.getPost(route.params.id)
      } catch {
        post.value = null
      } finally {
        loading.value = false
      }
    }

    onMounted(load)
    watch(() => route.params.id, load)

    return { post, loading }
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
  margin: 16px 0;
  color: var(--ink-soft);
  line-height: 1.6;
}
.content {
  white-space: pre-wrap;
  line-height: 1.75;
}
.back {
  display: inline-block;
  margin-top: 24px;
  color: var(--accent);
}
</style>
