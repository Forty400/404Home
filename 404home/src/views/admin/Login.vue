<template>
  <div class="login-page">
    <form class="card-panel form" @submit.prevent="submit">
      <h1>管理登录</h1>
      <p class="hint">默认账号见 server/.env（开发环境：admin / admin123）</p>
      <div class="field">
        <label>用户名</label>
        <input v-model="username" autocomplete="username" required />
      </div>
      <div class="field">
        <label>密码</label>
        <input v-model="password" type="password" autocomplete="current-password" required />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, setToken } from '@/api'

export default {
  name: 'AdminLogin',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const username = ref('admin')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    async function submit() {
      error.value = ''
      loading.value = true
      try {
        const res = await api.login({
          username: username.value,
          password: password.value
        })
        setToken(res.token)
        router.replace(route.query.redirect || '/admin')
      } catch (e) {
        error.value = e.message || '登录失败'
      } finally {
        loading.value = false
      }
    }

    return { username, password, error, loading, submit }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}
.form {
  width: min(400px, 100%);
  padding: 28px;
}
h1 {
  margin: 0 0 8px;
  font-family: var(--font-display);
}
.hint {
  margin: 0 0 18px;
  color: var(--ink-soft);
  font-size: 0.88rem;
}
.error {
  color: var(--hot);
  margin: 0 0 12px;
}
.btn {
  width: 100%;
}
</style>
