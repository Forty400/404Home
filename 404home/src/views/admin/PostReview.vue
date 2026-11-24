<template>
  <div>
    <div class="head">
      <h1>待审稿件</h1>
      <p class="hint">机器人静默采集入库；通过后仍为草稿，需手动发布。</p>
    </div>
    <div class="card-panel table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>来源 bot</th>
            <th>出处</th>
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
            <td>{{ post.ingest_bot || '—' }}</td>
            <td>
              <a v-if="post.source_url" :href="post.source_url" target="_blank" rel="noopener">{{
                post.source_name || '链接'
              }}</a>
              <span v-else>—</span>
            </td>
            <td>{{ post.created_at }}</td>
            <td class="actions">
              <button class="btn btn-primary" type="button" @click="approve(post)">通过</button>
              <button class="btn btn-ghost" type="button" @click="fork(post)">另存副本</button>
              <RouterLink class="btn btn-ghost" :to="`/admin/posts/editor?id=${post.id}`">查看</RouterLink>
              <button class="btn btn-ghost" type="button" @click="reject(post)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!posts.length" class="empty">暂无待审稿</p>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { api } from '@/api'

export default {
  name: 'AdminPostReview',
  setup() {
    const posts = ref([])
    const error = ref('')

    async function load() {
      error.value = ''
      try {
        posts.value = await api.getPosts({ all: 1, lifecycle: 'pending_review' })
      } catch (e) {
        error.value = e.message
      }
    }

    async function approve(post) {
      await api.approvePost(post.id)
      await load()
    }

    async function fork(post) {
      const copy = await api.forkPost(post.id)
      window.location.href = `/admin/posts/editor?id=${copy.id}`
    }

    async function reject(post) {
      if (!confirm(`删除待审「${post.title}」？`)) return
      await api.deletePost(post.id)
      await load()
    }

    onMounted(load)
    return { posts, error, approve, fork, reject }
  }
}
</script>

<style scoped>
.head { margin-bottom: 16px; }
h1 { margin: 0 0 6px; font-family: var(--font-display); }
.hint { margin: 0; color: var(--ink-soft); font-size: 0.9rem; }
.sub { color: var(--ink-soft); font-size: 0.84rem; margin-top: 4px; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; }
.empty { padding: 16px; color: var(--ink-soft); }
.error { color: #b91c1c; }
</style>
