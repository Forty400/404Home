import { ref } from 'vue'

const open = ref(false)
const mode = ref('login')
const redirect = ref('')
const tick = ref(0)

export function useAuthModal() {
  function openLogin(opts = {}) {
    mode.value = 'login'
    redirect.value = typeof opts.redirect === 'string' ? opts.redirect : ''
    open.value = true
  }

  function openRegister(opts = {}) {
    mode.value = 'register'
    redirect.value = typeof opts.redirect === 'string' ? opts.redirect : ''
    open.value = true
  }

  function close() {
    open.value = false
  }

  function switchMode(next) {
    mode.value = next === 'register' ? 'register' : 'login'
  }

  /** Notify Header / Trial to refresh user after login/register */
  function notifyAuthChanged() {
    tick.value += 1
  }

  return {
    open,
    mode,
    redirect,
    tick,
    openLogin,
    openRegister,
    close,
    switchMode,
    notifyAuthChanged
  }
}
