<template>
  <div class="page trial-page">
    <div class="container trial-layout">
      <header class="trial-head">
        <div>
          <h1>DeepSeek 试用</h1>
          <p class="sub">{{ modelHint }}</p>
        </div>
        <div v-if="user" class="balance-chip">
          <span>余额</span>
          <strong>¥{{ (user.balance_cents / 100).toFixed(2) }}</strong>
          <em>/ ¥{{ (user.balance_cap_cents / 100).toFixed(2) }}</em>
        </div>
      </header>

      <div v-if="!ready" class="card-panel state">加载中…</div>

      <div v-else-if="!user" class="card-panel state">
        <p>使用前请先登录或注册账号。会话记录会保存在服务器，换设备可继续查看。</p>
        <div class="actions">
          <RouterLink class="btn btn-primary" :to="{ name: 'user-login', query: { redirect: '/trial' } }">
            登录
          </RouterLink>
          <RouterLink class="btn" :to="{ name: 'user-register', query: { redirect: '/trial' } }">
            注册
          </RouterLink>
        </div>
      </div>

      <div v-else class="workspace">
        <aside class="sidebar card-panel" :class="{ open: sidebarOpen }">
          <div class="side-top">
            <button type="button" class="btn btn-primary new-btn" @click="startNewChat">
              新对话
            </button>
            <button type="button" class="side-close" aria-label="关闭列表" @click="sidebarOpen = false">
              ×
            </button>
          </div>
          <p class="side-label">历史会话</p>
          <ul class="session-list">
            <li v-if="!sessions.length" class="side-empty">暂无记录，发送一条消息开始</li>
            <li
              v-for="s in sessions"
              :key="s.id"
              class="session-item"
              :class="{ active: sessionId === s.id }"
            >
              <button type="button" class="session-main" @click="openSession(s.id)">
                <span class="session-title">{{ s.title || '新对话' }}</span>
                <span class="session-time">{{ formatTime(s.updated_at) }}</span>
              </button>
              <button
                type="button"
                class="session-del"
                title="删除"
                aria-label="删除会话"
                @click.stop="removeSession(s.id)"
              >
                ×
              </button>
            </li>
          </ul>
        </aside>

        <div class="chat-shell card-panel">
          <div class="chat-toolbar">
            <button type="button" class="btn btn-ghost menu-btn" @click="sidebarOpen = !sidebarOpen">
              会话
            </button>
            <span class="chat-title">{{ currentTitle }}</span>
          </div>
          <div class="messages" ref="listEl">
            <div v-if="!messages.length" class="empty">
              向 DeepSeek 提问。回复按用量扣费；左侧可切换历史会话。
            </div>
            <div
              v-for="(m, i) in messages"
              :key="m.id || i"
              class="bubble"
              :class="m.role"
            >
              <span class="role">{{ m.role === 'user' ? '我' : '助手' }}</span>
              <p>{{ m.content }}</p>
              <small v-if="m.cost_cents" class="cost">本条约 ¥{{ (m.cost_cents / 100).toFixed(2) }}</small>
            </div>
          </div>
          <form class="composer" @submit.prevent="send">
            <textarea
              v-model="draft"
              rows="2"
              placeholder="输入消息…"
              :disabled="sending"
              @keydown.enter.exact.prevent="send"
            />
            <button class="btn btn-primary" type="submit" :disabled="sending || !draft.trim()">
              {{ sending ? '发送中…' : '发送' }}
            </button>
          </form>
          <p v-if="notice" class="notice" :class="{ err: noticeIsError }">{{ notice }}</p>
        </div>
      </div>
    </div>
    <div v-if="sidebarOpen" class="side-mask" @click="sidebarOpen = false" />
  </div>
</template>

<script>
import { computed, nextTick, onMounted, ref } from 'vue'
import { api, clearUserToken, getUserToken } from '@/api'

export default {
  name: 'Trial',
  setup() {
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

    const currentTitle = computed(() => {
      if (!sessionId.value) return '新对话'
      const s = sessions.value.find((x) => x.id === sessionId.value)
      return s?.title || '对话'
    })

    function formatTime(raw) {
      if (!raw) return ''
      const s = String(raw)
      // SQLite datetime('now') → "YYYY-MM-DD HH:MM:SS"
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
          modelHint.value = st.configured
            ? `模型 ${st.model} · 记录已存服务器`
            : '服务端尚未配置 DEEPSEEK_API_KEY'
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

    async function send() {
      const text = draft.value.trim()
      if (!text || sending.value) return
      notice.value = ''
      noticeIsError.value = false
      messages.value.push({ role: 'user', content: text })
      draft.value = ''
      sending.value = true
      await scrollBottom()
      try {
        const res = await api.chatComplete({
          message: text,
          sessionId: sessionId.value
        })
        sessionId.value = res.sessionId
        messages.value.push({
          id: res.message.id,
          role: 'assistant',
          content: res.message.content,
          cost_cents: res.message.cost_cents
        })
        if (res.user) user.value = res.user
        if (res.charged_cents != null) {
          notice.value = `已扣费 ¥${(res.charged_cents / 100).toFixed(2)}`
        }
        await loadSessions()
      } catch (e) {
        noticeIsError.value = true
        notice.value = e.message || '发送失败'
        if (e.data?.code === 'DEEPSEEK_NOT_CONFIGURED') {
          notice.value = '服务端未配置 DEEPSEEK_API_KEY，请在 server/.env 中设置后重启 API'
        }
        if (e.data?.code === 'INSUFFICIENT_BALANCE') {
          notice.value = '余额不足，请联系运营加额后再试'
        }
      } finally {
        sending.value = false
        await scrollBottom()
      }
    }

    onMounted(loadUser)
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
      send
    }
  }
}
</script>

<style scoped>
.trial-layout {
  display: grid;
  gap: 16px;
  max-width: 1100px;
}
.trial-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}
.trial-head h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 1.9rem);
}
.sub {
  margin: 6px 0 0;
  color: var(--ink-soft);
  font-size: 0.92rem;
}
.balance-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--accent-soft);
  border: 1px solid var(--line);
  font-size: 0.9rem;
}
.balance-chip strong {
  color: var(--accent);
  font-size: 1.05rem;
}
.balance-chip em {
  font-style: normal;
  color: var(--ink-soft);
  font-size: 0.85rem;
}
.state {
  padding: 28px 22px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.workspace {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 14px;
  align-items: stretch;
  min-height: min(68vh, 640px);
}
.sidebar {
  display: flex;
  flex-direction: column;
  padding: 12px;
  min-height: 0;
  overflow: hidden;
}
.side-top {
  display: flex;
  gap: 8px;
  align-items: center;
}
.new-btn {
  flex: 1;
}
.side-close {
  display: none;
  border: none;
  background: transparent;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--ink-soft);
  cursor: pointer;
  padding: 4px 8px;
}
.side-label {
  margin: 12px 0 8px;
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.session-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  display: grid;
  gap: 4px;
  align-content: start;
}
.side-empty {
  color: var(--ink-soft);
  font-size: 0.88rem;
  padding: 8px 4px;
}
.session-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: stretch;
  border-radius: 10px;
  border: 1px solid transparent;
}
.session-item.active {
  background: var(--accent-soft);
  border-color: var(--line);
}
.session-main {
  text-align: left;
  border: none;
  background: transparent;
  padding: 10px 10px;
  cursor: pointer;
  min-width: 0;
  display: grid;
  gap: 2px;
  color: var(--ink);
}
.session-item:hover {
  background: var(--accent-soft);
}
.session-title {
  font-size: 0.9rem;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.session-time {
  font-size: 0.75rem;
  color: var(--ink-soft);
}
.session-del {
  border: none;
  background: transparent;
  color: var(--ink-soft);
  cursor: pointer;
  padding: 0 10px;
  font-size: 1.1rem;
}
.session-del:hover {
  color: var(--hot);
}
.chat-shell {
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  min-height: min(68vh, 640px);
  padding: 0;
  overflow: hidden;
}
.chat-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}
.menu-btn {
  display: none;
}
.chat-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.messages {
  padding: 16px;
  overflow-y: auto;
  display: grid;
  gap: 12px;
  align-content: start;
}
.empty {
  color: var(--ink-soft);
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 12px 4px;
}
.bubble {
  max-width: min(92%, 560px);
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--bg-elevated);
}
.bubble.user {
  justify-self: end;
  background: var(--accent-soft);
}
.bubble .role {
  display: block;
  font-size: 0.75rem;
  color: var(--ink-soft);
  margin-bottom: 4px;
}
.bubble p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.45;
  font-size: 0.95rem;
}
.cost {
  display: block;
  margin-top: 6px;
  color: var(--ink-soft);
  font-size: 0.75rem;
}
.composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 12px;
  border-top: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg-elevated) 90%, transparent);
}
.composer textarea {
  resize: vertical;
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--bg-elevated);
  color: var(--ink);
}
.notice {
  margin: 0;
  padding: 0 12px 12px;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.notice.err {
  color: var(--hot);
}
.side-mask {
  display: none;
}
@media (max-width: 860px) {
  .workspace {
    grid-template-columns: 1fr;
  }
  .menu-btn {
    display: inline-flex;
  }
  .sidebar {
    position: fixed;
    z-index: 40;
    left: 0;
    top: 0;
    bottom: 0;
    width: min(300px, 86vw);
    border-radius: 0;
    transform: translateX(-105%);
    transition: transform 0.2s ease;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .side-close {
    display: inline-block;
  }
  .side-mask {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 35;
    background: color-mix(in srgb, var(--ink) 40%, transparent);
  }
}
@media (max-width: 560px) {
  .composer {
    grid-template-columns: 1fr;
  }
  .composer .btn {
    width: 100%;
  }
}
</style>
