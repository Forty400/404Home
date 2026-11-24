import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { api, clearUserToken, getUserToken } from '@/api'

/**
 * Trial page: user session, chat history, send/charge UI state.
 * Billing rules stay on the server; this only drives the /trial UI.
 */
export function useTrialChat({ authTick } = {}) {
  const user = ref(null)
  const ready = ref(false)
  const draft = ref('')
  const messages = ref([])
  const sessions = ref([])
  const sending = ref(false)
  const notice = ref('')
  const noticeIsError = ref(false)
  const listEl = ref(null)
  const sessionId = ref(null)
  const modelHint = ref('桌面与手机浏览器可用')
  const sidebarOpen = ref(false)
  const loadingSession = ref(false)
  let abortCtrl = null

  const currentTitle = computed(() => {
    if (!sessionId.value) return '新对话'
    const s = sessions.value.find((x) => x.id === sessionId.value)
    return s?.title || '对话'
  })

  function formatTime(raw) {
    if (!raw) return ''
    const s = String(raw)
    if (s.length >= 16) return s.slice(5, 16).replace('-', '/')
    return s
  }

  async function scrollBottom() {
    await nextTick()
    if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight
  }

  async function loadSessions() {
    try {
      const res = await api.chatSessions()
      sessions.value = res.sessions || []
    } catch {
      sessions.value = []
    }
  }

  async function openSession(id) {
    if (loadingSession.value || sending.value) return
    loadingSession.value = true
    notice.value = ''
    try {
      const res = await api.chatMessages(id)
      sessionId.value = id
      messages.value = (res.messages || []).filter((m) => m.role !== 'system')
      sidebarOpen.value = false
      await scrollBottom()
    } catch (e) {
      noticeIsError.value = true
      notice.value = e.message || '加载会话失败'
    } finally {
      loadingSession.value = false
    }
  }

  function startNewChat() {
    sessionId.value = null
    messages.value = []
    notice.value = ''
    noticeIsError.value = false
    sidebarOpen.value = false
    draft.value = ''
  }

  async function removeSession(id) {
    if (!window.confirm('确定删除该会话？')) return
    try {
      await api.chatDeleteSession(id)
      if (sessionId.value === id) startNewChat()
      await loadSessions()
    } catch (e) {
      noticeIsError.value = true
      notice.value = e.message || '删除失败'
    }
  }

  async function loadUser() {
    if (!getUserToken()) {
      user.value = null
      ready.value = true
      return
    }
    try {
      const res = await api.userMe()
      user.value = res.user
      try {
        const st = await api.chatStatus()
        if (st.configured) {
          const provider = st.provider ? `${st.provider} · ` : ''
          modelHint.value = `模型 ${provider}${st.model} · 流式 · 记录已存服务器`
        } else {
          modelHint.value = '服务端尚未配置 DEEPSEEK_API_KEY'
        }
      } catch {
        /* ignore */
      }
      await loadSessions()
      if (sessions.value.length) {
        await openSession(sessions.value[0].id)
      }
    } catch {
      clearUserToken()
      user.value = null
    } finally {
      ready.value = true
    }
  }

  function stopGenerate() {
    if (abortCtrl) {
      abortCtrl.abort()
      abortCtrl = null
    }
  }

  function applyStreamError(e) {
    if (e?.name === 'AbortError') {
      noticeIsError.value = false
      notice.value = '已停止生成'
      return
    }
    noticeIsError.value = true
    notice.value = e.message || '发送失败'
    const code = e.data?.code
    if (code === 'DEEPSEEK_NOT_CONFIGURED' || code === 'LLM_NOT_CONFIGURED') {
      notice.value =
        'DEEPSEEK_NOT_CONFIGURED：服务端未配置 DEEPSEEK_API_KEY（见 server/.env），演示可说明「Key 仅服务端」'
    }
    if (code === 'INSUFFICIENT_BALANCE') {
      notice.value = '余额不足：请联系站长或管理员加额后再试（暂无在线付款）'
    }
  }

  async function send() {
    const text = draft.value.trim()
    if (!text || sending.value) return
    notice.value = ''
    noticeIsError.value = false
    messages.value.push({ role: 'user', content: text })
    const assistant = { role: 'assistant', content: '', streaming: true }
    messages.value.push(assistant)
    draft.value = ''
    sending.value = true
    abortCtrl = new AbortController()
    await scrollBottom()
    try {
      const res = await api.chatCompleteStream(
        {
          message: text,
          sessionId: sessionId.value
        },
        {
          signal: abortCtrl.signal,
          onEvent: (ev) => {
            if (ev.type === 'meta' && ev.sessionId) {
              sessionId.value = ev.sessionId
            }
            if (ev.type === 'delta' && ev.content) {
              assistant.content += ev.content
              scrollBottom()
            }
          }
        }
      )
      sessionId.value = res.sessionId || sessionId.value
      if (res.message) {
        assistant.id = res.message.id
        assistant.content = res.message.content
        assistant.cost_cents = res.message.cost_cents
      }
      assistant.streaming = false
      if (res.user) user.value = res.user
      if (res.charged_cents != null) {
        notice.value = `已扣费 ¥${(res.charged_cents / 100).toFixed(2)}`
      }
      await loadSessions()
    } catch (e) {
      assistant.streaming = false
      if (!assistant.content) {
        messages.value = messages.value.filter((m) => m !== assistant)
      }
      applyStreamError(e)
    } finally {
      abortCtrl = null
      sending.value = false
      await scrollBottom()
    }
  }

  onMounted(loadUser)
  if (authTick) {
    watch(authTick, () => {
      loadUser()
    })
  }

  return {
    user,
    ready,
    draft,
    messages,
    sessions,
    sending,
    notice,
    noticeIsError,
    listEl,
    sessionId,
    modelHint,
    sidebarOpen,
    currentTitle,
    formatTime,
    startNewChat,
    openSession,
    removeSession,
    send,
    stopGenerate
  }
}
