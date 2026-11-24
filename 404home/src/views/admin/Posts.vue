<template>
  <div>
    <div class="head">
      <h1>资讯总览</h1>
      <div class="head-actions">
        <RouterLink class="btn btn-ghost" to="/admin/posts/review">待审</RouterLink>
        <RouterLink class="btn btn-primary" to="/admin/posts/editor">手写发文</RouterLink>
      </div>
    </div>

    <div class="card-panel table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>类型</th>
            <th>专题</th>
            <th>生命周期</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id">
            <td>
              <strong>{{ post.title }}</strong>
              <div class="sub">{{ post.summary }}</div>
            </td>
            <td>{{ post.type === 'news' ? '资讯' : '教程' }}</td>
            <td>{{ topicLabel(post.topic) }}{{ post.is_hot ? ' · 热' : '' }}</td>
            <td>{{ lifecycleLabel(post.lifecycle) }}</td>
            <td>{{ post.created_at }}</td>
            <td class="actions">
              <RouterLink class="btn btn-ghost" :to="`/admin/posts/editor?id=${post.id}`">编辑</RouterLink>
              <button
                v-if="post.lifecycle === 'published'"
                class="btn btn-ghost"
                type="button"
                @click="archive(post)"
              >
                下线
              </button>
              <button
                v-if="post.lifecycle === 'draft'"
                class="btn btn-ghost"
                type="button"
                @click="publish(post)"
              >
                发布
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { api } from '@/api'

const TOPIC_LABELS = {
  plugin: '插件',
  dev: '开发',
  method: '方法论',
  news: '新闻'
}

const LIFE_LABELS = {
  pending_review: '待审',
  draft: '草稿',
  published: '已发布',
  archived: '回收站'
}

function topicLabel(topic) {
  return TOPIC_LABELS[topic] || topic || '—'
}

function lifecycleLabel(life) {
  return LIFE_LABELS[life] || life || '—'
}

export default {
  name: 'AdminPosts',
  setup() {
    const posts = ref([])

    async function load() {
      const all = await api.getPosts({ all: 1 })
      posts.value = all.filter((p) => p.lifecycle !== 'archived')
    }

    async function archive(post) {
      await api.archivePost(post.id)
      await load()
    }

    async function publish(post) {
      await api.publishPost(post.id)
      await load()
    }

    onMounted(load)
    return { posts, topicLabel, lifecycleLabel, archive, publish }
  }
}
</script>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.head-actions { display: flex; gap: 8px; }
h1 {
  margin: 0;
  font-family: var(--font-display);
}
.table-wrap { overflow: auto; }
.sub {
  color: var(--ink-soft);
  font-size: 0.84rem;
  margin-top: 4px;
}
.actions { display: flex; gap: 8px; }
</style>
