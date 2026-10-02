<template>
  <header class="header">
    <div class="container header-inner">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">404</span>
        <span class="brand-text">Home</span>
      </RouterLink>
      <nav class="nav">
        <RouterLink to="/">工具集</RouterLink>
        <RouterLink to="/news">每日资讯</RouterLink>
        <RouterLink to="/tutorials">教程资源</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
      <RouterLink class="admin-link" to="/admin">管理</RouterLink>
    </div>
    <div class="container">
      <CategoryNav :categories="categories" />
    </div>
  </header>
</template>

<script>
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import CategoryNav from '@/components/CategoryNav.vue'

export default {
  name: 'AppHeader',
  components: { CategoryNav },
  setup() {
    const categories = ref([])
    onMounted(async () => {
      try {
        categories.value = await api.getCategories()
      } catch (e) {
        console.error(e)
      }
    })
    return { categories }
  }
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
  background: rgba(243, 239, 230, 0.9);
  border-bottom: 1px solid var(--line);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 0 8px;
}

.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-family: var(--font-display);
  font-size: 1.55rem;
  letter-spacing: -0.03em;
}

.brand-mark {
  color: var(--accent);
  font-weight: 700;
}

.brand-text {
  font-weight: 550;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-left: 8px;
}

.nav a {
  color: var(--ink-soft);
  font-size: 0.95rem;
}

.nav a.router-link-active {
  color: var(--accent);
  font-weight: 600;
}

.admin-link {
  margin-left: auto;
  font-size: 0.88rem;
  color: var(--ink-soft);
}

@media (max-width: 720px) {
  .header-inner {
    flex-wrap: wrap;
  }
  .admin-link {
    margin-left: 0;
  }
}
</style>
