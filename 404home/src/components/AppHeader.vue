<template>
  <header class="header">
    <div class="container header-inner">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">404</span>
        <span class="brand-text">Home</span>
      </RouterLink>
      <button
        type="button"
        class="nav-toggle"
        :aria-expanded="navOpen ? 'true' : 'false'"
        aria-label="菜单"
        @click="navOpen = !navOpen"
      >
        <span />
        <span />
        <span />
      </button>
      <nav class="nav" :class="{ open: navOpen }">
        <RouterLink to="/" @click="navOpen = false">工具集</RouterLink>
        <RouterLink to="/trial" @click="navOpen = false">DeepSeek 试用</RouterLink>
        <RouterLink to="/news" @click="navOpen = false">每日资讯</RouterLink>
        <RouterLink to="/tutorials" @click="navOpen = false">教程资源</RouterLink>
        <RouterLink to="/about" @click="navOpen = false">关于</RouterLink>
      </nav>
      <div class="header-actions">
        <button
          type="button"
          class="theme-switch"
          role="switch"
          :aria-checked="resolved === 'dark' ? 'true' : 'false'"
          :aria-label="themeAriaLabel"
          :title="themeTitle"
          @click="toggleLightDark"
        >
          <span class="theme-switch-track" aria-hidden="true">
            <span class="theme-switch-thumb" />
          </span>
          <span class="theme-switch-text">{{ resolved === 'dark' ? '暗色' : '亮色' }}</span>
        </button>
        <template v-if="userEmail">
          <span class="user-chip" :title="userEmail">{{ userEmail }}</span>
          <button type="button" class="text-btn" @click="logout">退出</button>
        </template>
        <template v-else>
          <RouterLink class="text-link" to="/login">登录</RouterLink>
          <RouterLink class="text-link accent" to="/register">注册</RouterLink>
        </template>
        <RouterLink class="admin-link" to="/admin">管理</RouterLink>
      </div>
    </div>
    <div class="container">
      <CategoryNav :categories="categories" />
    </div>
  </header>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api, clearUserToken, getUserToken } from '@/api'
import CategoryNav from '@/components/CategoryNav.vue'
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'AppHeader',
  components: { CategoryNav },
  setup() {
    const route = useRoute()
    const categories = ref([])
    const navOpen = ref(false)
    const userEmail = ref('')
    const { preference, resolved, setTheme } = useTheme()

    function toggleLightDark() {
      setTheme(resolved.value === 'dark' ? 'light' : 'dark')
    }

    const themeTitle = computed(() => {
      if (preference.value === 'system') {
        return `跟随系统（当前${resolved.value === 'dark' ? '暗色' : '亮色'}），点击切换亮/暗色`
      }
      return resolved.value === 'dark' ? '暗色模式，点击切换为亮色' : '亮色模式，点击切换为暗色'
    })
    const themeAriaLabel = computed(() => {
      const next = resolved.value === 'dark' ? '亮色' : '暗色'
      return `主题开关，当前${resolved.value === 'dark' ? '暗色' : '亮色'}，点击切换为${next}`
    })

    async function refreshUser() {
      if (!getUserToken()) {
        userEmail.value = ''
        return
      }
      try {
        const res = await api.userMe()
        userEmail.value = res.user?.email || ''
      } catch {
        clearUserToken()
        userEmail.value = ''
      }
    }

    function logout() {
      clearUserToken()
      userEmail.value = ''
      if (route.path.startsWith('/trial')) {
        window.location.reload()
      }
    }

    onMounted(async () => {
      try {
        categories.value = await api.getCategories()
      } catch (e) {
        console.error(e)
      }
      await refreshUser()
    })

    watch(
      () => route.fullPath,
      () => {
        navOpen.value = false
        refreshUser()
      }
    )

    return {
      categories,
      navOpen,
      userEmail,
      logout,
      resolved,
      themeTitle,
      themeAriaLabel,
      toggleLightDark
    }
  }
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  border-bottom: 1px solid var(--line);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0 8px;
  flex-wrap: wrap;
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

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.user-chip {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.text-link,
.text-btn,
.admin-link {
  font-size: 0.88rem;
  color: var(--ink-soft);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.text-link.accent {
  color: var(--accent);
  font-weight: 600;
}

.theme-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--bg-elevated);
  padding: 4px 10px 4px 4px;
  cursor: pointer;
  color: var(--ink-soft);
  font-size: 0.82rem;
}

.theme-switch:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.theme-switch-track {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: var(--line);
  transition: background 0.18s ease;
}

.theme-switch[aria-checked='true'] .theme-switch-track {
  background: var(--accent);
}

.theme-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg-elevated);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  transition: transform 0.18s ease;
}

.theme-switch[aria-checked='true'] .theme-switch-thumb {
  transform: translateX(16px);
}

.theme-switch-text {
  min-width: 2em;
  line-height: 1;
}

.nav-toggle {
  display: none;
  margin-left: auto;
  width: 40px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--bg-elevated);
  padding: 8px 10px;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
}

.nav-toggle span {
  display: block;
  height: 2px;
  background: var(--ink);
  border-radius: 1px;
}

@media (max-width: 820px) {
  .nav-toggle {
    display: flex;
  }

  .nav {
    display: none;
    width: 100%;
    margin: 0;
    order: 10;
    flex-direction: column;
    gap: 10px;
    padding: 8px 0 4px;
  }

  .nav.open {
    display: flex;
  }

  .header-actions {
    margin-left: 0;
    width: 100%;
    order: 11;
    padding-bottom: 4px;
  }
}
</style>
