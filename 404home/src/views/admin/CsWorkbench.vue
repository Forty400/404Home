<template>
  <div class="cs-admin">
    <div class="top">
      <h1>客服工作台</h1>
      <div class="tabs">
        <button type="button" :class="{ on: tab === 'inbox' }" @click="tab = 'inbox'">会话</button>
        <button type="button" :class="{ on: tab === 'scripts' }" @click="tab = 'scripts'; loadScripts()">
          话术
        </button>
      </div>
      <button
        class="btn"
        :class="online ? 'btn-primary' : 'btn-ghost'"
        type="button"
        @click="toggleOnline"
      >
        {{ online ? '我在线' : '我离线' }}
      </button>
    </div>

    <div v-if="tab === 'inbox'" class="panes">
      <aside class="queue">
        <h2>队列</h2>
        <button
          v-for="s in inbox"
          :key="s.id"
          type="button"
          class="q-item"
          :class="{ active: selectedId === s.id }"
          @click="selectSession(s.id)"
        >
          <strong>{{ s.displayName || s.user_email }}</strong>
          <span class="st">{{ statusLabel(s.status) }}</span>
          <span class="prev">{{ s.last_content || '' }}</span>
        </button>
        <p v-if="!inbox.length" class="empty">暂无会话</p>
      </aside>

      <section class="chat">
        <div v-if="!detail" class="empty pad">选择左侧会话</div>
        <template v-else>
          <div class="chat-msgs" ref="msgBox">
            <div
              v-for="m in detail.messages"
              :key="m.id"
              class="msg"
              :class="m.role"
            >
              <span>{{ m.content }}</span>
            </div>
          </div>
          <form class="reply" @submit.prevent="reply">
            <input v-model="draft" placeholder="回复用户…" :disabled="!canReply" />
            <button class="btn btn-primary" type="submit" :disabled="!canReply || !draft.trim()">
              发送
            </button>
          </form>
          <p v-if="detail.session.status === 'human' && !canReply" class="hint">
            该会话已分配给其他客服
          </p>
        </template>
      </section>

      <aside class="meta">
        <template v-if="detail">
          <h2>用户</h2>
          <p><strong>{{ detail.user?.displayName || detail.user?.email }}</strong></p>
          <p class="muted">状态：{{ statusLabel(detail.session.status) }}</p>
          <p class="muted">ID：{{ detail.session.id }}</p>
          <h3>快捷话术</h3>
          <button
            v-for="sc in scripts"
            :key="sc.id"
            type="button"
            class="script-btn"
            :disabled="!canReply"
            @click="draft = sc.body"
          >
            {{ sc.title || sc.faq_label || '话术' }}
          </button>
        </template>
        <p v-else class="empty">—</p>
      </aside>
    </div>

    <div v-else class="scripts-panel card-panel">
      <form class="script-form" @submit.prevent="saveScript">
        <input v-model="form.title" placeholder="标题" required />
        <input v-model="form.faq_label" placeholder="FAQ 按钮文案（可空）" />
        <input v-model="form.keywordsText" placeholder="关键词，逗号分隔" />
        <textarea v-model="form.body" placeholder="回复正文" rows="3" required />
        <input v-model.number="form.sort" type="number" placeholder="排序" />
        <label class="chk"><input v-model="form.enabled" type="checkbox" /> 启用</label>
        <button class="btn btn-primary" type="submit">
          {{ form.id ? '更新' : '新增' }}
        </button>
        <button v-if="form.id" class="btn btn-ghost" type="button" @click="resetForm">取消</button>
      </form>
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>FAQ</th>
            <th>关键词</th>
            <th>排序</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sc in scripts" :key="sc.id">
            <td>{{ sc.title }}</td>
            <td>{{ sc.faq_label }}</td>
            <td>{{ (sc.keywords || []).join(', ') }}</td>
            <td>{{ sc.sort }}</td>
            <td>
              <button class="btn btn-ghost" type="button" @click="editScript(sc)">编辑</button>
              <button class="btn btn-ghost" type="button" @click="removeScript(sc.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { api } from '@/api'

export default {
  name: 'AdminCsWorkbench',
  setup() {
    const tab = ref('inbox')
    const online = ref(false)
    const inbox = ref([])
    const selectedId = ref(null)
    const detail = ref(null)
    const draft = ref('')
    const scripts = ref([])
    const msgBox = ref(null)
    const myAdminId = ref(null)
    const form = reactive({
      id: null,
      title: '',
      faq_label: '',
      keywordsText: '',
      body: '',
      sort: 100,
      enabled: true
    })

    let poll = null

    const canReply = computed(() => {
      const s = detail.value?.session
      return s && s.status === 'human' && s.assignee_admin_id === myAdminId.value
    })

    function statusLabel(st) {
      return ({ bot: '话术中', queued: '排队', human: '人工中', closed: '已关闭' })[st] || st
    }

    async function loadMe() {
      const me = await api.me()
      myAdminId.value = me.id
    }

    async function loadPresence() {
      const res = await api.csAdminPresenceGet()
      online.value = !!res.online
    }

    async function toggleOnline() {
      const next = !online.value
      await api.csAdminPresenceSet(next)
      online.value = next
    }

    async function loadInbox() {
      const res = await api.csAdminInbox()
      inbox.value = res.sessions || []
    }

    async function selectSession(id) {
      selectedId.value = id
      const res = await api.csAdminSession(id)
      detail.value = res
      await nextTick()
      if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
    }

    async function reply() {
      if (!canReply.value || !draft.value.trim()) return
      await api.csAdminReply(selectedId.value, draft.value.trim())
      draft.value = ''
      await selectSession(selectedId.value)
      await loadInbox()
    }

    async function loadScripts() {
      const res = await api.csAdminScripts()
      scripts.value = res.scripts || []
    }

    function resetForm() {
      form.id = null
      form.title = ''
      form.faq_label = ''
      form.keywordsText = ''
      form.body = ''
      form.sort = 100
      form.enabled = true
    }

    function editScript(sc) {
      form.id = sc.id
      form.title = sc.title || ''
      form.faq_label = sc.faq_label || ''
      form.keywordsText = (sc.keywords || []).join(',')
      form.body = sc.body || ''
      form.sort = sc.sort
      form.enabled = !!sc.enabled
      tab.value = 'scripts'
    }

    async function saveScript() {
      const body = {
        title: form.title,
        faq_label: form.faq_label || null,
        keywords: form.keywordsText
          .split(/[,，]/)
          .map((s) => s.trim())
          .filter(Boolean),
        body: form.body,
        sort: form.sort,
        enabled: form.enabled
      }
      if (form.id) await api.csAdminUpdateScript(form.id, body)
      else await api.csAdminCreateScript(body)
      resetForm()
      await loadScripts()
    }

    async function removeScript(id) {
      if (!confirm('删除该话术？')) return
      await api.csAdminDeleteScript(id)
      await loadScripts()
    }

    onMounted(async () => {
      await loadMe()
      await loadPresence()
      await loadInbox()
      await loadScripts()
      poll = setInterval(async () => {
        if (tab.value !== 'inbox') return
        await loadInbox()
        if (selectedId.value) await selectSession(selectedId.value)
      }, 2500)
    })

    onUnmounted(() => {
      if (poll) clearInterval(poll)
    })

    return {
      tab,
      online,
      inbox,
      selectedId,
      detail,
      draft,
      scripts,
      form,
      msgBox,
      canReply,
      statusLabel,
      toggleOnline,
      selectSession,
      reply,
      loadScripts,
      saveScript,
      editScript,
      removeScript,
      resetForm
    }
  }
}
</script>

<style scoped>
.top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.top h1 {
  margin: 0;
  font-size: 1.4rem;
  margin-right: auto;
}

.tabs button {
  border: 1px solid var(--line);
  background: var(--bg);
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.tabs button.on {
  background: var(--accent);
  color: var(--on-accent);
  border-color: var(--accent);
}

.panes {
  display: grid;
  grid-template-columns: 240px 1fr 200px;
  gap: 12px;
  min-height: 60vh;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-elevated);
  overflow: hidden;
}

.queue,
.meta {
  border-right: 1px solid var(--line);
  padding: 12px;
  overflow-y: auto;
  max-height: 70vh;
}

.meta {
  border-right: none;
  border-left: 1px solid var(--line);
}

.queue h2,
.meta h2,
.meta h3 {
  margin: 0 0 8px;
  font-size: 0.95rem;
}

.q-item {
  display: grid;
  gap: 2px;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
}

.q-item.active,
.q-item:hover {
  background: var(--accent-soft);
}

.q-item .st {
  font-size: 0.75rem;
  color: var(--ink-soft);
}

.q-item .prev {
  font-size: 0.75rem;
  color: var(--ink-soft);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat {
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 70vh;
}

.chat-msgs {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.msg {
  max-width: 85%;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--accent-soft);
  font-size: 0.9rem;
  white-space: pre-wrap;
}

.msg.user {
  align-self: flex-end;
  background: var(--accent);
  color: var(--on-accent);
}

.msg.system {
  align-self: center;
  background: transparent;
  color: var(--ink-soft);
  font-size: 0.8rem;
}

.msg.agent {
  align-self: flex-start;
  background: #dcfce7;
}

.reply {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid var(--line);
}

.reply input {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px;
}

.hint,
.empty,
.muted {
  color: var(--ink-soft);
  font-size: 0.85rem;
}

.pad {
  padding: 24px;
}

.script-btn {
  display: block;
  width: 100%;
  text-align: left;
  margin-bottom: 6px;
  border: 1px dashed var(--line);
  background: var(--bg);
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 0.8rem;
}

.scripts-panel {
  padding: 16px;
}

.script-form {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
  max-width: 560px;
}

.script-form input,
.script-form textarea {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px;
  background: var(--bg);
}

.chk {
  display: flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 900px) {
  .panes {
    grid-template-columns: 1fr;
  }
}
</style>
