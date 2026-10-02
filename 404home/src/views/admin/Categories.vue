<template>
  <div>
    <div class="head">
      <h1>分类管理</h1>
      <button class="btn btn-primary" type="button" @click="openCreate">新增分类</button>
    </div>

    <div class="card-panel table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>名称</th>
            <th>Slug</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <td>{{ cat.name }}</td>
            <td>{{ cat.slug }}</td>
            <td>{{ cat.sort }}</td>
            <td class="actions">
              <button class="btn btn-ghost" type="button" @click="openEdit(cat)">编辑</button>
              <button class="btn btn-ghost" type="button" @click="remove(cat)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="modal">
      <form class="card-panel form" @submit.prevent="save">
        <h2>{{ form.id ? '编辑分类' : '新增分类' }}</h2>
        <div class="field">
          <label>名称</label>
          <input v-model="form.name" required />
        </div>
        <div class="field">
          <label>Slug</label>
          <input v-model="form.slug" required />
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
  return { id: null, name: '', slug: '', sort: 0 }
}

export default {
  name: 'AdminCategories',
  setup() {
    const categories = ref([])
    const showForm = ref(false)
    const form = reactive(emptyForm())
    const error = ref('')

    async function load() {
      categories.value = await api.getCategories()
    }

    function openCreate() {
      Object.assign(form, emptyForm())
      error.value = ''
      showForm.value = true
    }

    function openEdit(cat) {
      Object.assign(form, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        sort: cat.sort
      })
      error.value = ''
      showForm.value = true
    }

    async function save() {
      error.value = ''
      try {
        if (form.id) await api.updateCategory(form.id, { ...form })
        else await api.createCategory({ ...form })
        showForm.value = false
        await load()
      } catch (e) {
        error.value = e.message
      }
    }

    async function remove(cat) {
      if (!confirm(`确定删除分类「${cat.name}」？`)) return
      await api.deleteCategory(cat.id)
      await load()
    }

    onMounted(load)
    return { categories, showForm, form, error, openCreate, openEdit, save, remove }
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
.actions { display: flex; gap: 8px; }
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
  width: min(460px, 100%);
  padding: 22px;
}
.error { color: var(--hot); }
</style>
