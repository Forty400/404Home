<template>
  <RouterLink class="article-card" :to="detailTo">
    <div class="cover-wrap">
      <img class="cover" :src="post.cover || '/covers/hot-01.svg'" :alt="post.title" loading="lazy" />
      <span v-if="post.is_hot" class="badge">热门</span>
    </div>
    <div class="body">
      <div class="meta">
        <span class="topic">{{ topicLabel }}</span>
        <time>{{ relativeTime }}</time>
      </div>
      <h3>{{ post.title }}</h3>
      <p class="summary">{{ post.summary }}</p>
      <p v-if="post.source_name" class="source">出处：{{ post.source_name }}</p>
    </div>
  </RouterLink>
</template>

<script>
import { computed } from 'vue'
import { formatRelativeTime } from '@/utils/formatRelativeTime'

const TOPIC_LABELS = {
  plugin: 'AI 插件',
  dev: 'AI 开发',
  method: 'AI 方法论',
  news: 'AI 新闻'
}

export default {
  name: 'ArticleCard',
  props: {
    post: { type: Object, required: true }
  },
  setup(props) {
    const topicLabel = computed(() => TOPIC_LABELS[props.post.topic] || '资讯')
    const detailTo = computed(() =>
      props.post.type === 'tutorial' ? `/tutorials/${props.post.id}` : `/news/${props.post.id}`
    )
    const relativeTime = computed(() => formatRelativeTime(props.post.created_at))
    return { topicLabel, detailTo, relativeTime }
  }
}
</script>

<style scoped>
.article-card {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  gap: 16px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--bg-elevated);
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.article-card:hover {
  border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
  box-shadow: var(--shadow);
}

.cover-wrap {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: var(--accent-soft);
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--hot);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
}

.body {
  display: grid;
  gap: 6px;
  align-content: start;
  min-width: 0;
}

.meta {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 0.78rem;
  color: var(--ink-soft);
}

.topic {
  color: var(--accent);
  font-weight: 600;
}

h3 {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.35;
  font-weight: 650;
}

.summary {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.9rem;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.source {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--ink-soft);
}

@media (max-width: 640px) {
  .article-card {
    grid-template-columns: 1fr;
  }
}
</style>
