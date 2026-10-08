<template>
  <form class="search-bar" @submit.prevent="onSubmit">
    <input
      v-model="keyword"
      type="search"
      placeholder="搜索 AI 工具，例如 PPT、配音、编程..."
      aria-label="搜索 AI 工具"
    />
    <button class="btn btn-primary" type="submit">搜索</button>
  </form>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SearchBar',
  props: {
    modelValue: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const router = useRouter()
    const keyword = ref(props.modelValue || '')

    watch(
      () => props.modelValue,
      (v) => {
        keyword.value = v || ''
      }
    )

    function onSubmit() {
      const q = keyword.value.trim()
      emit('update:modelValue', q)
      router.push({ name: 'search', query: q ? { q } : {} })
    }

    return { keyword, onSubmit }
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 10px;
  width: min(640px, 100%);
}

.search-bar input {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.85rem 1.1rem;
  background: var(--bg-elevated);
  color: var(--ink);
  box-shadow: var(--shadow);
}

.search-bar input:focus {
  outline: 2px solid color-mix(in srgb, var(--accent) 35%, transparent);
  border-color: var(--accent);
}
</style>
