<template>
  <div class="admin-layout">
    <aside class="side">
      <RouterLink class="brand" to="/">404Home 管理</RouterLink>
      <nav>
        <RouterLink to="/admin">概览</RouterLink>
        <RouterLink to="/admin/users">用户加额</RouterLink>
        <RouterLink to="/admin/chats">对话用量</RouterLink>
        <RouterLink to="/admin/tools">工具</RouterLink>
        <RouterLink to="/admin/categories">分类</RouterLink>
        <RouterLink to="/admin/posts">资讯/教程</RouterLink>
      </nav>
      <button class="btn btn-ghost" type="button" @click="logout">退出登录</button>
    </aside>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { clearToken } from '@/api'

export default {
  name: 'AdminLayout',
  setup() {
    const router = useRouter()
    function logout() {
      clearToken()
      router.push({ name: 'admin-login' })
    }
    return { logout }
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 220px 1fr;
}

.side {
  background: var(--accent);
  color: var(--on-accent);
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.brand {
  font-family: var(--font-display);
  font-size: 1.2rem;
}

nav {
  display: grid;
  gap: 8px;
}

nav a {
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  color: color-mix(in srgb, var(--on-accent) 80%, transparent);
}

nav a.router-link-active {
  background: color-mix(in srgb, var(--on-accent) 14%, transparent);
  color: var(--on-accent);
}

.btn {
  margin-top: auto;
  color: var(--on-accent);
  border-color: color-mix(in srgb, var(--on-accent) 28%, transparent);
}

.content {
  padding: 28px;
  background: var(--bg);
}

@media (max-width: 860px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }
  .side {
    position: sticky;
    top: 0;
    z-index: 5;
  }
  nav {
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    overflow-x: auto;
  }
}
</style>
