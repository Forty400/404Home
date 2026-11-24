<template>
  <div>
    <div class="head">
      <h1>回收站</h1>
      <p class="hint">已下线归档；可恢复为草稿，或彻底删除清库。</p>
    </div>
    <div class="card-panel table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>专题</th>
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
            <td>{{ post.topic }}</td>
            <td>{{ post.created_at }}</td>
            <td class="actions">
              <button class="btn btn-primary" type="button" @click="restore(post)">恢复草稿</button>
              <button class="btn btn-ghost" type="button" @click="purge(post)">彻底删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!posts.length" class="empty">回收站为空</p>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { api } from '@/api'

export default {
  name: 'AdminPostTrash',
  setup() {
    const posts = ref([])
    const error = ref('')

    async function load() {
      error.value = ''
      try {
        posts.value = await api.getPosts({ all: 1, lifecycle: 'archived' })
      } catch (e) {
        error.value = e.message
      }
    }

    async function restore(post) {
      await api.restorePost(post.id)
      await load()
    }

    async function purge(post) {
      if (!confirm(`彻底删除「${post.title}」？不可恢复。`)) return
      await api.deletePost(post.id)
      await load()
    }

    onMounted(load)
    return { posts, error, restore, purge }
  }
}
</script>

<style scoped>
.head { margin-bottom: 16px; }
h1 { margin: 0 0 6px; font-family: var(--font-display); }
.hint { margin: 0; color: var(--ink-soft); font-size: 0.9rem; }
.sub { color: var(--ink-soft); font-size: 0.84rem; margin-top: 4px; }
.actions { display: flex; gap: 8px; }
.empty { padding: 16px; color: var(--ink-soft); }
.error { color: #b91c1c; }
</style>
