<template>
  <div>
    <div class="head">
      <h1>对话与用量</h1>
      <form class="search" @submit.prevent="loadSessions">
        <input v-model="q" placeholder="按用户邮箱筛选" />
        <button class="btn btn-ghost" type="submit">筛选</button>
        <button class="btn btn-ghost" type="button" @click="resetFilter">重置</button>
      </form>
    </div>

    <div class="stats">
      <div class="card-panel stat" v-for="item in summaryCards" :key="item.label">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <div class="card-panel table-wrap" style="margin-bottom: 16px">
      <h2 class="block-title">用户用量 Top</h2>
      <table class="table">
        <thead>
          <tr>
            <th>邮箱</th>
            <th>会话数</th>
            <th>Prompt</th>
            <th>Completion</th>
            <th>扣费</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in byUser" :key="u.user_id">
            <td>
              <button type="button" class="linkish" @click="filterByEmail(u.email)">
                {{ u.email || '-' }}
              </button>
            </td>
            <td>{{ u.session_count }}</td>
            <td>{{ u.prompt_tokens }}</td>
            <td>{{ u.completion_tokens }}</td>
            <td>¥{{ yuan(u.cost_cents) }}</td>
          </tr>
          <tr v-if="!byUser.length">
            <td colspan="5" class="empty">暂无用量数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-panel table-wrap">
      <h2 class="block-title">会话列表</h2>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户</th>
            <th>标题</th>
            <th>消息</th>
            <th>Tokens</th>
            <th>扣费</th>
            <th>更新</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in sessions" :key="s.id">
            <td>{{ s.id }}</td>
            <td>{{ s.email || s.user_id }}</td>
            <td class="title-cell">{{ s.title }}</td>
            <td>{{ s.message_count }}</td>
            <td>{{ Number(s.prompt_tokens) + Number(s.completion_tokens) }}</td>
            <td>¥{{ yuan(s.cost_cents) }}</td>
            <td class="muted">{{ s.updated_at }}</td>
            <td>
              <button class="btn btn-ghost" type="button" @click="openDetail(s.id)">详情</button>
            </td>
          </tr>
          <tr v-if="!sessions.length">
            <td colspan="8" class="empty">暂无会话</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="detail" class="modal" @click.self="detail = null">
      <div class="card-panel detail">
        <div class="detail-head">
          <div>
            <h2>{{ detail.session.title }}</h2>
            <p class="muted">
              #{{ detail.session.id }} · {{ detail.session.email || '-' }} ·
              Prompt {{ detail.usage.prompt_tokens }} /
              Completion {{ detail.usage.completion_tokens }} /
              ¥{{ yuan(detail.usage.cost_cents) }}
            </p>
          </div>
          <button class="btn btn-ghost" type="button" @click="detail = null">关闭</button>
        </div>
        <div class="msg-list">
          <div
            v-for="m in detail.messages"
            :key="m.id"
            class="msg"
            :class="m.role"
          >
            <div class="msg-meta">
              <strong>{{ roleLabel(m.role) }}</strong>
              <span v-if="m.prompt_tokens || m.completion_tokens || m.cost_cents">
                in {{ m.prompt_tokens }} / out {{ m.completion_tokens }} /
                ¥{{ yuan(m.cost_cents) }}
              </span>
              <span class="muted">{{ m.created_at }}</span>
            </div>
            <pre>{{ m.content }}</pre>
          </div>
          <p v-if="!detail.messages.length" class="empty">无消息</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api'

export default {
  name: 'AdminChats',
  setup() {
    const q = ref('')
    const totals = ref({
      session_count: 0,
      message_count: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      cost_cents: 0
    })
    const byUser = ref([])
    const sessions = ref([])
    const detail = ref(null)

    function yuan(cents) {
      return (Number(cents || 0) / 100).toFixed(2)
    }

    function roleLabel(role) {
      if (role === 'user') return '用户'
      if (role === 'assistant') return '助手'
      return role
    }

    const summaryCards = computed(() => [
      { label: '会话数', value: totals.value.session_count },
      { label: '消息数', value: totals.value.message_count },
      { label: 'Prompt tokens', value: totals.value.prompt_tokens },
      { label: 'Completion tokens', value: totals.value.completion_tokens },
      { label: '累计扣费', value: `¥${yuan(totals.value.cost_cents)}` }
    ])

    async function loadSummary() {
      const res = await api.adminChatSummary()
      totals.value = res.totals || totals.value
      byUser.value = res.byUser || []
    }

    async function loadSessions() {
      const res = await api.adminChatSessions({ q: q.value, limit: 100 })
      sessions.value = res.sessions || []
    }

    function resetFilter() {
      q.value = ''
      loadSessions()
    }

    function filterByEmail(email) {
      q.value = email || ''
      loadSessions()
    }

    async function openDetail(id) {
      detail.value = await api.adminChatSession(id)
    }

    onMounted(async () => {
      await Promise.all([loadSummary(), loadSessions()])
    })

    return {
      q,
      totals,
      byUser,
      sessions,
      detail,
      summaryCards,
      yuan,
      roleLabel,
      loadSessions,
      resetFilter,
      filterByEmail,
      openDetail
    }
  }
}
</script>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
h1, h2 {
  margin: 0;
  font-family: var(--font-display);
}
.block-title {
  font-size: 1.1rem;
  padding: 14px 14px 0;
}
.search {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.search input {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 12px;
  min-width: 200px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.stat {
  padding: 16px;
  display: grid;
  gap: 6px;
}
.stat strong {
  font-size: 1.25rem;
  font-family: var(--font-display);
}
.stat span {
  color: var(--ink-soft);
  font-size: 0.88rem;
}
.table-wrap {
  overflow-x: auto;
  padding: 0 0 8px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.table th, .table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}
.table th {
  color: var(--ink-soft);
  font-weight: 600;
}
.title-cell {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.muted {
  color: var(--ink-soft);
  font-size: 0.85rem;
}
.empty {
  color: var(--ink-soft);
  text-align: center;
}
.linkish {
  border: none;
  background: none;
  color: var(--accent);
  cursor: pointer;
  padding: 0;
  font: inherit;
  text-decoration: underline;
}
.modal {
  position: fixed;
  inset: 0;
  background: rgba(28, 43, 36, 0.4);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 50;
}
.detail {
  width: min(760px, 100%);
  max-height: min(85vh, 800px);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
  padding: 0;
}
.detail-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}
.detail-head p {
  margin: 6px 0 0;
}
.msg-list {
  overflow-y: auto;
  padding: 14px 18px 20px;
  display: grid;
  gap: 12px;
}
.msg {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  background: #fff;
}
.msg.user {
  background: var(--accent-soft);
}
.msg-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.8rem;
  color: var(--ink-soft);
  margin-bottom: 6px;
}
.msg-meta strong {
  color: var(--ink);
}
.msg pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font: inherit;
  font-size: 0.92rem;
  line-height: 1.45;
}
</style>
