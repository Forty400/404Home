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
        <RouterLink
          to="/"
          active-class=""
          exact-active-class="router-link-active"
          @click="navOpen = false"
        >首页</RouterLink>
        <RouterLink to="/trial" @click="navOpen = false">DeepSeek 试用</RouterLink>
        <RouterLink to="/smart-search" @click="navOpen = false">智能检索</RouterLink>
        <RouterLink to="/news" @click="navOpen = false">每日资讯</RouterLink>
        <RouterLink to="/tutorials" @click="navOpen = false">教程资源</RouterLink>
        <RouterLink to="/about" @click="navOpen = false">关于</RouterLink>
        <div class="nav-auth">
          <template v-if="userEmail">
            <span class="user-chip" :title="userEmail">{{ userEmail }}</span>
            <button type="button" class="text-btn" @click="logout(); navOpen = false">退出</button>
          </template>
          <template v-else>
            <button
              type="button"
              class="text-link"
              @click="openLogin(); navOpen = false"
            >登录</button>
            <button
              type="button"
              class="text-link accent"
              @click="openRegister(); navOpen = false"
            >注册</button>
          </template>
        </div>
      </nav>
      <div class="header-actions">
        <button
          type="button"
          class="theme-bulb"
          :class="{ on: resolved === 'light' }"
          role="switch"
          :aria-checked="resolved === 'dark' ? 'true' : 'false'"
          :aria-label="themeAriaLabel"
          :title="themeTitle"
          @click="toggleLightDark"
        >
          <svg class="bulb-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              class="bulb-glow"
              d="M9 21h6M10 17h4M12 3a6 6 0 0 0-3.5 10.8c.6.45 1 1.1 1 1.85V17h5v-1.35c0-.75.4-1.4 1-1.85A6 6 0 0 0 12 3z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              class="bulb-rays"
              d="M12 1v1.2M4.6 6.2l.9.9M1.8 12H3M4.6 17.8l.9-.9M19.4 6.2l-.9.9M21 12h-1.2M19.4 17.8l-.9-.9"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <div class="auth-inline">
          <template v-if="userEmail">
            <span class="user-chip" :title="userEmail">{{ userEmail }}</span>
            <button type="button" class="text-btn" @click="logout">退出</button>
          </template>
          <template v-else>
            <button type="button" class="text-link" @click="openLogin()">登录</button>
            <button type="button" class="text-link accent" @click="openRegister()">注册</button>
          </template>
        </div>
      </div>
    </div>
    <div v-if="showCategoryNav" class="container">
      <CategoryNav :categories="categories" />
    </div>
  </header>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api, clearUserToken, getUserToken } from '@/api'
import CategoryNav from '@/components/CategoryNav.vue'
import { useAuthModal } from '@/composables/useAuthModal'
import { useTheme } from '@/composables/useTheme'
import { shouldShowCategoryNav } from '@/utils/shouldShowCategoryNav'

export default {
  name: 'AppHeader',
  components: { CategoryNav },
  setup() {
    const route = useRoute()
    const categories = ref([])
    const navOpen = ref(false)
    const showCategoryNav = computed(() =>
      shouldShowCategoryNav(route.name, { navOpen: navOpen.value })
    )
    const userEmail = ref('')
    const { preference, resolved, setTheme } = useTheme()
    const { openLogin, openRegister, tick } = useAuthModal()

    function toggleLightDark() {
      setTheme(resolved.value === 'dark' ? 'light' : 'dark')
    }

    const themeTitle = computed(() => {
      if (preference.value === 'system') {
        return `跟随系统（当前${resolved.value === 'dark' ? '暗色' : '亮色'}）。亮灯=亮色，灭灯=暗色`
      }
      return resolved.value === 'dark'
        ? '暗色模式（灯灭），点击切换为亮色'
        : '亮色模式（灯亮），点击切换为暗色'
    })
    const themeAriaLabel = computed(() => {
      const next = resolved.value === 'dark' ? '亮色' : '暗色'
      return `主题灯泡，当前${resolved.value === 'dark' ? '暗色' : '亮色'}，点击切换为${next}`
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

    watch(tick, () => {
      refreshUser()
    })

    return {
      categories,
      navOpen,
      showCategoryNav,
      userEmail,
      logout,
      resolved,
      themeTitle,
      themeAriaLabel,
      toggleLightDark,
      openLogin,
      openRegister
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
  gap: 12px;
  padding: 10px 0 6px;
  flex-wrap: wrap;
}

.nav-auth {
  display: none;
}

.auth-inline {
  display: contents;
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
.text-btn {
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

.theme-bulb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--line);
  background: var(--bg-elevated);
  color: var(--ink-soft);
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
}

.theme-bulb:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.theme-bulb.on {
  color: var(--accent);
  background: var(--accent-soft);
  border-color: color-mix(in srgb, var(--accent) 40%, var(--line));
}

.bulb-icon {
  width: 20px;
  height: 20px;
}

.theme-bulb:not(.on) .bulb-rays {
  opacity: 0.25;
}

.theme-bulb.on .bulb-rays {
  opacity: 1;
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

  .nav-auth {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding-top: 6px;
    border-top: 1px solid var(--line);
  }

  .auth-inline {
    display: none;
  }

  .header-actions {
    margin-left: 0;
    width: auto;
    order: 0;
    padding-bottom: 0;
  }
}
</style>
