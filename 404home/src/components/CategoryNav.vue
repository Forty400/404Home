<template>
  <nav class="cat-nav" v-if="categories.length">
    <RouterLink
      v-for="cat in categories"
      :key="cat.id"
      :to="`/category/${cat.slug}`"
      class="cat-item"
    >
      {{ cat.name.replace(/^AI/, '') }}
    </RouterLink>
  </nav>
</template>

<script>
export default {
  name: 'CategoryNav',
  props: {
    categories: { type: Array, default: () => [] }
  }
}
</script>

<style scoped>
.cat-nav {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 0 12px;
  scrollbar-width: thin;
}

.cat-item {
  flex: 0 0 auto;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.8);
  color: var(--ink-soft);
  font-size: 0.82rem;
  white-space: nowrap;
}

.cat-item.router-link-active {
  background: var(--accent);
  border-color: var(--accent);
  color: #f4fff8;
}
</style>
