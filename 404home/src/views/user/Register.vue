<template>
  <div class="page auth-page">
    <div class="container">
      <form class="card-panel form" @submit.prevent="submit">
        <h1>注册账号</h1>
        <p class="hint">注册即获 ¥3 试用额度（图形验证码防刷）</p>
        <div class="field">
          <label>邮箱</label>
          <input v-model="email" type="email" autocomplete="email" required />
        </div>
        <div class="field">
          <label>密码</label>
          <PasswordInput
            v-model="password"
            autocomplete="new-password"
            :minlength="6"
            required
          />
        </div>
        <div class="field">
          <label>验证码</label>
          <div class="captcha-row">
            <input v-model="captchaCode" autocomplete="off" required />
            <button type="button" class="captcha-btn" @click="loadCaptcha" v-html="captchaSvg" />
          </div>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? '提交中...' : '注册' }}
        </button>
        <p class="switch">
          已有账号？
          <RouterLink :to="{ name: 'user-login', query: $route.query }">去登录</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, setUserToken } from '@/api'
import PasswordInput from '@/components/PasswordInput.vue'

export default {
  name: 'UserRegister',
  components: { PasswordInput },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const email = ref('')
    const password = ref('')
    const captchaId = ref('')
    const captchaCode = ref('')
    const captchaSvg = ref('')
    const error = ref('')
    const loading = ref(false)

    async function loadCaptcha() {
      try {
        const res = await api.getCaptcha()
        captchaId.value = res.captchaId
        captchaSvg.value = res.svg
        captchaCode.value = ''
      } catch (e) {
        error.value = e.message || '验证码加载失败'
      }
    }

    async function submit() {
      error.value = ''
      loading.value = true
      try {
        const res = await api.userRegister({
          email: email.value,
          password: password.value,
          captchaId: captchaId.value,
          captchaCode: captchaCode.value
        })
        setUserToken(res.token)
        router.replace(route.query.redirect || '/trial')
      } catch (e) {
        error.value = e.message || '注册失败'
        await loadCaptcha()
      } finally {
        loading.value = false
      }
    }

    onMounted(loadCaptcha)
    return {
      email,
      password,
      captchaCode,
      captchaSvg,
      error,
      loading,
      loadCaptcha,
      submit
    }
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
}
.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.captcha-row input {
  flex: 1;
}
.captcha-btn {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0;
  background: var(--bg-elevated);
  cursor: pointer;
  line-height: 0;
  flex-shrink: 0;
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
