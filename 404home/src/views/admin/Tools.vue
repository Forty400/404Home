<template>
  <div>
    <div class="head">
      <h1>工具管理</h1>
      <button class="btn btn-primary" type="button" @click="openCreate">新增工具</button>
    </div>

    <div class="card-panel table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>名称</th>
            <th>分类</th>
            <th>标记</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tool in tools" :key="tool.id">
            <td>
              <strong>{{ tool.name }}</strong>
              <div class="sub">{{ tool.summary }}</div>
            </td>
            <td>{{ tool.category_name || '-' }}</td>
            <td>
              <span v-if="tool.is_hot" class="badge badge-hot">热门</span>
              <span v-if="tool.is_new" class="badge badge-new">新</span>
            </td>
            <td>{{ tool.enabled ? '启用' : '停用' }}</td>
            <td class="actions">
              <button class="btn btn-ghost" type="button" @click="openEdit(tool)">编辑</button>
              <button class="btn btn-ghost" type="button" @click="remove(tool)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="modal">
      <form class="card-panel form" @submit.prevent="save">
        <h2>{{ form.id ? '编辑工具' : '新增工具' }}</h2>
        <div class="field">
          <label>名称</label>
          <input v-model="form.name" required />
        </div>
        <div class="field">
          <label>Slug</label>
          <input v-model="form.slug" required />
        </div>
        <div class="field">
          <label>简介</label>
          <textarea v-model="form.summary" />
        </div>
        <div class="field">
          <label>官网 URL</label>
          <input v-model="form.url" />
        </div>
        <div class="field">
          <label>分类</label>
          <select v-model.number="form.category_id">
            <option :value="null">未分类</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="field">
          <label>标签（逗号分隔）</label>
          <input v-model="tagsText" />
        </div>
        <div class="checks">
          <label><input v-model="form.is_hot" type="checkbox" /> 热门</label>
          <label><input v-model="form.is_new" type="checkbox" /> 最新</label>
          <label><input v-model="form.enabled" type="checkbox" /> 启用</label>
        </div>
        <div class="field">
          <label>排序</label>
          <input v-model.number="form.sort" type="number" />
        </div>
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

function emptyForm() {
  return {
    id: null,
    name: '',
    slug: '',
    summary: '',
    url: '',
    category_id: null,
    is_hot: false,
    is_new: false,
    enabled: true,
    sort: 0
  }
}

export default {
  name: 'AdminTools',
  setup() {
    const tools = ref([])
    const categories = ref([])
    const showForm = ref(false)
    const form = reactive(emptyForm())
    const tagsText = ref('')
    const error = ref('')

    async function load() {
      const [toolRes, cats] = await Promise.all([
        api.getTools({ all: 1, pageSize: 200 }),
        api.getCategories()
      ])
      tools.value = toolRes.items
      categories.value = cats
    }

    function openCreate() {
      Object.assign(form, emptyForm())
      tagsText.value = ''
      error.value = ''
      showForm.value = true
    }

    function openEdit(tool) {
      Object.assign(form, {
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        summary: tool.summary,
        url: tool.url,
        category_id: tool.category_id,
        is_hot: tool.is_hot,
        is_new: tool.is_new,
        enabled: tool.enabled,
        sort: tool.sort
      })
      tagsText.value = (tool.tags || []).join(',')
      error.value = ''
      showForm.value = true
    }

    async function save() {
      error.value = ''
      const payload = {
        ...form,
        tags: tagsText.value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }
      try {
        if (form.id) {
          await api.updateTool(form.id, payload)
        } else {
          await api.createTool(payload)
        }
        showForm.value = false
        await load()
      } catch (e) {
        error.value = e.message
      }
    }

    async function remove(tool) {
      if (!confirm(`确定删除「${tool.name}」？`)) return
      await api.deleteTool(tool.id)
      await load()
    }

    onMounted(load)

    return {
      tools,
      categories,
      showForm,
      form,
      tagsText,
      error,
      openCreate,
      openEdit,
      save,
      remove
    }
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
.table-wrap {
  overflow: auto;
}
.sub {
  color: var(--ink-soft);
  font-size: 0.84rem;
  margin-top: 4px;
}
.actions {
  display: flex;
  gap: 8px;
}
.modal {
  position: fixed;
  inset: 0;
  background: rgba(20, 30, 26, 0.35);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 50;
}
.form {
  width: min(520px, 100%);
  padding: 22px;
  max-height: 90vh;
  overflow: auto;
}
.checks {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
}
.error {
  color: var(--hot);
}
</style>
