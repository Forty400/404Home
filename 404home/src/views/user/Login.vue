<template>
  <div class="page auth-page">
    <div class="container">
      <form class="card-panel form" @submit.prevent="submit">
        <h1>登录</h1>
        <p class="hint">使用注册邮箱登录后可进入 DeepSeek 试用</p>
        <div class="field">
          <label>邮箱</label>
          <input v-model="email" type="email" autocomplete="email" required />
        </div>
        <div class="field">
          <label>密码</label>
          <PasswordInput v-model="password" autocomplete="current-password" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p class="switch">
          没有账号？
          <RouterLink :to="{ name: 'user-register', query: $route.query }">注册</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, setUserToken } from '@/api'
import PasswordInput from '@/components/PasswordInput.vue'

export default {
  name: 'UserLogin',
  components: { PasswordInput },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    async function submit() {
      error.value = ''
      loading.value = true
      try {
        const res = await api.userLogin({
          email: email.value,
          password: password.value
        })
        setUserToken(res.token)
        router.replace(route.query.redirect || '/trial')
      } catch (e) {
        error.value = e.message || '登录失败'
      } finally {
        loading.value = false
      }
    }

    return { email, password, error, loading, submit }
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 60vh;
}
.form {
  width: min(420px, 100%);
  margin: 24px auto;
  padding: 28px 24px;
  display: grid;
  gap: 14px;
}
h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.6rem;
}
.hint, .switch {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.92rem;
}
.field {
  display: grid;
  gap: 6px;
}
.field label {
  font-size: 0.88rem;
  color: var(--ink-soft);
}
.field input {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--bg-elevated);
  color: var(--ink);
}
.error {
  margin: 0;
  color: var(--hot);
  font-size: 0.9rem;
}
.switch a {
  color: var(--accent);
  font-weight: 600;
}
</style>
