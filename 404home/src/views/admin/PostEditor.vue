<template>
  <div>
    <div class="head">
      <h1>{{ form.id ? '编辑稿件' : '手写发文' }}</h1>
      <p class="hint">正文纯文本；用单独一行 <code>## 标题</code> 分段。可另存草稿或发布。</p>
    </div>
    <form class="card-panel form" @submit.prevent="saveDraft">
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
          <option value="plugin">插件</option>
          <option value="dev">开发</option>
          <option value="method">方法论</option>
          <option value="news">新闻</option>
        </select>
      </div>
      <div class="field">
        <label>标题</label>
        <input v-model="form.title" required />
      </div>
      <div class="field">
        <label>摘要</label>
        <input v-model="form.summary" />
      </div>
      <div class="field">
        <label>正文</label>
        <textarea v-model="form.content" class="long" rows="16" />
      </div>
      <div class="field">
        <label>封面 URL</label>
        <input v-model="form.cover" />
      </div>
      <div class="field">
        <label>出处名</label>
        <input v-model="form.source_name" />
      </div>
      <div class="field">
        <label>出处链接</label>
        <input v-model="form.source_url" />
      </div>
      <label class="check"><input v-model="form.is_hot" type="checkbox" /> 热门</label>
      <p v-if="form.lifecycle" class="meta">当前状态：{{ form.lifecycle }}</p>
      <div class="actions">
        <button class="btn btn-ghost" type="submit">保存草稿</button>
        <button class="btn btn-primary" type="button" @click="publish">发布上线</button>
        <button
          v-if="form.id && form.lifecycle === 'published'"
          class="btn btn-ghost"
          type="button"
          @click="archive"
        >
          下线到回收站
        </button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="ok" class="ok">{{ ok }}</p>
    </form>
  </div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'

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
    lifecycle: 'draft'
  }
}

export default {
  name: 'AdminPostEditor',
  setup() {
    const route = useRoute()
    const form = reactive(emptyForm())
    const error = ref('')
    const ok = ref('')

    async function load() {
      const id = Number(route.query.id)
      if (!id) return
      const all = await api.getPosts({ all: 1 })
      const post = all.find((p) => p.id === id)
      if (!post) {
        error.value = '稿件不存在'
        return
      }
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
        lifecycle: post.lifecycle || 'draft'
      })
    }

    async function saveDraft() {
      error.value = ''
      ok.value = ''
      try {
        const body = { ...form, lifecycle: 'draft', published: false }
        if (form.id) {
          const p = await api.updatePost(form.id, body)
          form.lifecycle = p.lifecycle
        } else {
          const p = await api.createPost(body)
          form.id = p.id
          form.lifecycle = p.lifecycle
        }
        ok.value = '已保存草稿'
      } catch (e) {
        error.value = e.message
      }
    }

    async function publish() {
      error.value = ''
      ok.value = ''
      try {
        if (!form.id) await saveDraft()
        if (!form.id) return
        await api.updatePost(form.id, { ...form, lifecycle: 'draft' })
        const p = await api.publishPost(form.id)
        form.lifecycle = p.lifecycle
        ok.value = '已发布'
      } catch (e) {
        error.value = e.message
      }
    }

    async function archive() {
      if (!form.id) return
      const p = await api.archivePost(form.id)
      form.lifecycle = p.lifecycle
      ok.value = '已下线到回收站'
    }

    onMounted(load)
    return { form, error, ok, saveDraft, publish, archive }
  }
}
</script>

<style scoped>
.head { margin-bottom: 16px; }
h1 { margin: 0 0 6px; font-family: var(--font-display); }
.hint { margin: 0; color: var(--ink-soft); font-size: 0.9rem; }
.form { padding: 22px; display: grid; gap: 12px; max-width: 820px; }
.field { display: grid; gap: 6px; }
.long { min-height: 280px; font-family: ui-monospace, monospace; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; }
.check { display: flex; align-items: center; gap: 8px; }
.meta { color: var(--ink-soft); margin: 0; }
.error { color: #b91c1c; margin: 0; }
.ok { color: #15803d; margin: 0; }
</style>
