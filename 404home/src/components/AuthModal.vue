<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="auth-overlay"
      role="presentation"
      @click.self="close"
    >
      <div
        class="auth-dialog card-panel"
        role="dialog"
        aria-modal="true"
        :aria-label="mode === 'login' ? '登录' : '注册'"
      >
        <button type="button" class="auth-close" aria-label="关闭" @click="close">×</button>

        <div class="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'login'"
            :class="{ active: mode === 'login' }"
            @click="switchMode('login')"
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'register'"
            :class="{ active: mode === 'register' }"
            @click="switchMode('register')"
          >
            注册
          </button>
        </div>

        <form v-if="mode === 'login'" class="auth-form" @submit.prevent="submitLogin">
          <div class="auth-form-body">
            <p class="hint">使用注册邮箱登录后可进入 DeepSeek 试用</p>
            <div class="field">
              <label for="auth-email">邮箱</label>
              <input
                id="auth-email"
                ref="firstInput"
                v-model="email"
                type="email"
                autocomplete="email"
                required
              />
            </div>
            <div class="field">
              <label>密码</label>
              <PasswordInput v-model="password" autocomplete="current-password" required />
            </div>
            <label class="remember">
              <input v-model="remember" type="checkbox" />
              记住邮箱（密码不缓存）
            </label>
            <p v-if="error" class="error">{{ error }}</p>
          </div>
          <button class="btn btn-primary auth-submit" type="submit" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <form v-else class="auth-form" @submit.prevent="submitRegister">
          <div class="auth-form-body">
            <p class="hint">注册即获 ¥3 试用额度</p>
            <div class="field">
              <label for="auth-reg-email">邮箱</label>
              <input
                id="auth-reg-email"
                ref="firstInput"
                v-model="email"
                type="email"
                autocomplete="email"
                required
              />
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
                <button
                  type="button"
                  class="captcha-btn"
                  aria-label="刷新验证码"
                  @click="loadCaptcha"
                  v-html="captchaSvg"
                />
              </div>
            </div>
            <p v-if="error" class="error">{{ error }}</p>
          </div>
          <button class="btn btn-primary auth-submit" type="submit" :disabled="loading">
            {{ loading ? '提交中...' : '注册' }}
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api, setUserToken } from '@/api'
import PasswordInput from '@/components/PasswordInput.vue'
import { useAuthModal } from '@/composables/useAuthModal'
import { useLoginCache } from '@/composables/useLoginCache'

export default {
  name: 'AuthModal',
  components: { PasswordInput },
  setup() {
    const router = useRouter()
    const { open, mode, redirect, close, switchMode, notifyAuthChanged } = useAuthModal()
    const { load, save, clear } = useLoginCache()

    const email = ref('')
    const password = ref('')
    const remember = ref(true)
    const captchaId = ref('')
    const captchaCode = ref('')
    const captchaSvg = ref('')
    const error = ref('')
    const loading = ref(false)
    const firstInput = ref(null)

    function applyCache() {
      const cached = load()
      if (cached) {
        email.value = cached.email
        remember.value = true
      } else {
        remember.value = true
      }
      // Never restore password from local cache
      password.value = ''
    }

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

    function afterSuccess() {
      notifyAuthChanged()
      const target = redirect.value
      close()
      if (target && router.currentRoute.value.fullPath !== target) {
        router.replace(target)
      }
    }

    async function submitLogin() {
      error.value = ''
      loading.value = true
      try {
        const res = await api.userLogin({
          email: email.value,
          password: password.value
        })
        setUserToken(res.token)
        if (remember.value) {
          save(email.value)
        } else {
          clear()
        }
        afterSuccess()
      } catch (e) {
        error.value = e.message || '登录失败'
      } finally {
        loading.value = false
      }
    }

    async function submitRegister() {
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
        if (remember.value) {
          save(email.value)
        }
        afterSuccess()
      } catch (e) {
        error.value = e.message || '注册失败'
        await loadCaptcha()
      } finally {
        loading.value = false
      }
    }

    function onKeydown(e) {
      if (e.key === 'Escape' && open.value) close()
    }

    watch(open, async (isOpen) => {
      if (!isOpen) {
        error.value = ''
        loading.value = false
        window.removeEventListener('keydown', onKeydown)
        return
      }
      error.value = ''
      applyCache()
      if (mode.value === 'register') {
        await loadCaptcha()
      }
      window.addEventListener('keydown', onKeydown)
      await nextTick()
      firstInput.value?.focus?.()
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', onKeydown)
    })

    watch(mode, async (m) => {
      if (!open.value) return
      error.value = ''
      if (m === 'register') {
        await loadCaptcha()
      } else {
        applyCache()
      }
      await nextTick()
      firstInput.value?.focus?.()
    })

    return {
      open,
      mode,
      email,
      password,
      remember,
      captchaCode,
      captchaSvg,
      error,
      loading,
      firstInput,
      close,
      switchMode,
      loadCaptcha,
      submitLogin,
      submitRegister
    }
  }
}
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: color-mix(in srgb, var(--ink) 36%, transparent);
  backdrop-filter: blur(4px);
}

.auth-dialog {
  position: relative;
  width: min(420px, 100%);
  padding: 22px 20px 16px;
  max-height: min(92dvh, 92vh);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.auth-close {
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  background: transparent;
  color: var(--ink-soft);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 4px 8px;
}

.auth-close:hover {
  color: var(--ink);
}

.auth-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.auth-tabs button {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--bg);
  color: var(--ink-soft);
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.95rem;
}

.auth-tabs button.active {
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
  background: var(--accent-soft);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  flex: 1;
}
.auth-form-body {
  display: grid;
  gap: 12px;
  min-height: 0;
  overflow: auto;
  padding-bottom: 4px;
}
.auth-submit {
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  width: 100%;
}

.hint {
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

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--ink-soft);
  cursor: pointer;
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
</style>
