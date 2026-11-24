<template>
  <div>
    <div class="head">
      <h1>资讯 / 教程</h1>
      <button class="btn btn-primary" type="button" @click="openCreate">新增内容</button>
    </div>

    <div class="card-panel table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>类型</th>
            <th>专题</th>
            <th>状态</th>
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
            <td>{{ post.published ? '已发布' : '草稿' }}</td>
            <td>{{ post.created_at }}</td>
            <td class="actions">
              <button class="btn btn-ghost" type="button" @click="openEdit(post)">编辑</button>
              <button class="btn btn-ghost" type="button" @click="remove(post)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="modal">
      <form class="card-panel form" @submit.prevent="save">
        <h2>{{ form.id ? '编辑内容' : '新增内容' }}</h2>
        <div class="field">
          <label>类型</label>
          <select v-model="form.type">
            <option value="news">资讯</option>
            <option value="tutorial">教程</option>
          </select>
        </div>
        <div class="field">
          <label>专题</label>
          <select v-model="form.topic">
            <option value="plugin">AI 插件</option>
            <option value="dev">AI 开发</option>
            <option value="method">AI 方法论</option>
            <option value="news">AI 新闻</option>
          </select>
        </div>
        <div class="field">
          <label>标题</label>
          <input v-model="form.title" required />
        </div>
        <div class="field">
          <label>摘要</label>
          <textarea v-model="form.summary" />
        </div>
        <div class="field">
          <label>封面 URL</label>
          <input v-model="form.cover" placeholder="/covers/hot-01.svg" />
        </div>
        <div class="field">
          <label>出处名称</label>
          <input v-model="form.source_name" />
        </div>
        <div class="field">
          <label>出处链接</label>
          <input v-model="form.source_url" type="url" />
        </div>
        <div class="field">
          <label>正文</label>
          <textarea v-model="form.content" class="long" />
        </div>
        <label class="check"><input v-model="form.is_hot" type="checkbox" /> 热门</label>
        <label class="check"><input v-model="form.published" type="checkbox" /> 发布</label>
        <p v-if="error" class="error">{{ error }}</p>
        <div class="actions">
          <button class="btn btn-ghost" type="button" @click="showForm = false">取消</button>
          <button class="btn btn-primary" type="submit">保存</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue'
import { api } from '@/api'

const TOPIC_LABELS = {
  plugin: '插件',
  dev: '开发',
  method: '方法论',
  news: '新闻'
}

function emptyForm() {
  return {
    id: null,
    type: 'news',
    topic: 'news',
    title: '',
    summary: '',
    content: '',
    cover: '',
    source_name: '',
    source_url: '',
    is_hot: false,
    published: true
  }
}

function topicLabel(topic) {
  return TOPIC_LABELS[topic] || topic || '—'
}

export default {
  name: 'AdminPosts',
  setup() {
    const posts = ref([])
    const showForm = ref(false)
    const form = reactive(emptyForm())
    const error = ref('')

    async function load() {
      posts.value = await api.getPosts({ all: 1 })
    }

    function openCreate() {
      Object.assign(form, emptyForm())
      error.value = ''
      showForm.value = true
    }

    function openEdit(post) {
      Object.assign(form, {
        id: post.id,
        type: post.type,
        topic: post.topic || 'news',
        title: post.title,
        summary: post.summary,
        content: post.content,
        cover: post.cover || '',
        source_name: post.source_name || '',
        source_url: post.source_url || '',
        is_hot: !!post.is_hot,
        published: post.published
      })
      error.value = ''
      showForm.value = true
    }

    async function save() {
      error.value = ''
      try {
        if (form.id) await api.updatePost(form.id, { ...form })
        else await api.createPost({ ...form })
        showForm.value = false
        await load()
      } catch (e) {
        error.value = e.message
      }
    }

    async function remove(post) {
      if (!confirm(`确定删除「${post.title}」？`)) return
      await api.deletePost(post.id)
      await load()
    }

    onMounted(load)
    return { posts, showForm, form, error, openCreate, openEdit, save, remove, topicLabel }
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
h1, h2 {
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
.modal {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--ink) 40%, transparent);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 50;
}
.form {
  width: min(640px, 100%);
  padding: 22px;
  max-height: 90vh;
  overflow: auto;
}
.long { min-height: 180px; }
.check {
  display: inline-flex;
  gap: 8px;
  margin-bottom: 14px;
}
.error { color: var(--hot); }
</style>
