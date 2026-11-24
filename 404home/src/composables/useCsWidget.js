import { ref, onUnmounted } from 'vue'
import { api, getCsToken, setCsGuestToken, getUserToken } from '@/api'

const open = ref(false)
const loading = ref(false)
const sending = ref(false)
const error = ref('')
const session = ref(null)
const messages = ref([])
const faqs = ref([])
const displayName = ref('')
const draft = ref('')

let pollTimer = null

async function ensureCsAuth() {
  if (getCsToken()) return
  const res = await api.csGuest()
  if (!getUserToken()) setCsGuestToken(res.token)
  displayName.value = res.displayName || ''
}

async function refreshFaqs() {
  try {
    const res = await api.csFaqs()
    faqs.value = res.faqs || []
  } catch {
    faqs.value = []
  }
}

async function openSession() {
  loading.value = true
  error.value = ''
  try {
    await ensureCsAuth()
    const res = await api.csOpenSession()
    session.value = res.session
    messages.value = res.messages || []
    if (res.displayName) displayName.value = res.displayName
  } catch (e) {
    error.value = e.message || '无法打开客服'
  } finally {
    loading.value = false
  }
}

function startPoll() {
  stopPoll()
  pollTimer = setInterval(async () => {
    if (!open.value || !session.value?.id) return
    try {
      const res = await api.csMessages(session.value.id)
      session.value = res.session
      messages.value = res.messages || []
    } catch {
      /* ignore transient */
    }
  }, 2500)
}

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

export function useCsWidget() {
  async function openWidget() {
    open.value = true
    await refreshFaqs()
    await openSession()
    startPoll()
  }

  function closeWidget() {
    open.value = false
    stopPoll()
  }

  async function send(text) {
    const content = String(text ?? draft.value).trim()
    if (!content || !session.value?.id || sending.value) return
    sending.value = true
    error.value = ''
    draft.value = ''
    try {
      const res = await api.csSend(session.value.id, content)
      session.value = res.session
      const res2 = await api.csMessages(session.value.id)
      messages.value = res2.messages || []
    } catch (e) {
      error.value = e.message || '发送失败'
    } finally {
      sending.value = false
    }
  }

  async function transfer() {
    if (!session.value?.id || sending.value) return
    sending.value = true
    error.value = ''
    try {
      const res = await api.csTransfer(session.value.id)
      session.value = res.session
      messages.value = res.messages || []
    } catch (e) {
      error.value = e.message || '转人工失败'
    } finally {
      sending.value = false
    }
  }

  onUnmounted(stopPoll)

  return {
    open,
    loading,
    sending,
    error,
    session,
    messages,
    faqs,
    displayName,
    draft,
    openWidget,
    closeWidget,
    send,
    transfer
  }
}
