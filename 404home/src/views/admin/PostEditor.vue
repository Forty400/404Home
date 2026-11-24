<template>
  <div>
    <div class="head">
      <h1>{{ form.id ? '编辑稿件' : '手写发文' }}</h1>
      <p class="hint">源码可含 HTML；预览模式会消毒后渲染（去 script/事件）。也可用 <code>## 标题</code> 纯文本分段。</p>
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
        <div class="body-head">
          <label>正文</label>
          <div class="tabs" role="tablist">
            <button
              class="tab"
              type="button"
              :class="{ on: mode === 'source' }"
              @click="mode = 'source'"
            >
              源码
            </button>
            <button
              class="tab"
              type="button"
              :class="{ on: mode === 'preview' }"
              @click="mode = 'preview'"
            >
              预览
            </button>
          </div>
        </div>
        <textarea v-if="mode === 'source'" v-model="form.content" class="long" rows="16" />
        <div v-else class="preview" v-html="previewHtml" />
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
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import { looksLikeHtml, sanitizeHtml } from '@/utils/sanitizeHtml'
import { parsePostBody } from '@/utils/parsePostBody'

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

function escapeText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default {
  name: 'AdminPostEditor',
  setup() {
    const route = useRoute()
    const form = reactive(emptyForm())
    const error = ref('')
    const ok = ref('')
    const mode = ref('source')

    const previewHtml = computed(() => {
      const raw = form.content || ''
      if (looksLikeHtml(raw)) return sanitizeHtml(raw)
      const blocks = parsePostBody(raw)
      return blocks
        .map((b) =>
          b.type === 'h2' ? `<h2>${escapeText(b.text)}</h2>` : `<p>${escapeText(b.text)}</p>`
        )
        .join('\n')
    })

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
      if (looksLikeHtml(post.content || '')) mode.value = 'preview'
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
    return { form, error, ok, mode, previewHtml, saveDraft, publish, archive }
  }
}
</script>

<style scoped>
.head { margin-bottom: 16px; }
h1 { margin: 0 0 6px; font-family: var(--font-display); }
.hint { margin: 0; color: var(--ink-soft); font-size: 0.9rem; }
.form { padding: 22px; display: grid; gap: 12px; max-width: 820px; }
.field { display: grid; gap: 6px; }
.body-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.tabs { display: flex; gap: 6px; }
.tab {
  border: 1px solid var(--line, #d0d7de);
  background: transparent;
  border-radius: 8px;
  padding: 4px 10px;
  cursor: pointer;
}
.tab.on { background: var(--panel-2, #eef2f7); font-weight: 600; }
.long { min-height: 280px; font-family: ui-monospace, monospace; }
.preview {
  min-height: 280px;
  border: 1px solid var(--line, #d0d7de);
  border-radius: 10px;
  padding: 14px 16px;
  background: #fff;
  overflow: auto;
  line-height: 1.65;
}
.preview :deep(img) { max-width: 100%; height: auto; }
.preview :deep(h2) { margin: 0.8em 0 0.4em; font-size: 1.15rem; }
.preview :deep(p) { margin: 0 0 0.75em; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; }
.check { display: flex; align-items: center; gap: 8px; }
.meta { color: var(--ink-soft); margin: 0; }
.error { color: #b91c1c; margin: 0; }
.ok { color: #15803d; margin: 0; }
</style>
