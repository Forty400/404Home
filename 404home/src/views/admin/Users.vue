<template>
  <div>
    <div class="head">
      <h1>用户与加额</h1>
      <form class="search" @submit.prevent="load">
        <input v-model="q" placeholder="按邮箱搜索" />
        <button class="btn btn-ghost" type="submit">搜索</button>
      </form>
    </div>

    <div class="card-panel credit-panel">
      <h2>管理员加额</h2>
      <p class="hint">计入累充；达阈值可升 VIP 并补档差。金额单位：元。</p>
      <form class="credit-form" @submit.prevent="credit">
        <div class="field">
          <label>用户邮箱</label>
          <input v-model="creditForm.email" type="email" required placeholder="user@example.com" />
        </div>
        <div class="field">
          <label>加额（元）</label>
          <input v-model.number="creditForm.yuan" type="number" min="0.01" step="0.01" required />
        </div>
        <button class="btn btn-primary" type="submit" :disabled="crediting">
          {{ crediting ? '提交中…' : '确认加额' }}
        </button>
      </form>
      <p v-if="creditMsg" class="msg" :class="{ err: creditErr }">{{ creditMsg }}</p>
    </div>

    <div class="card-panel table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>邮箱</th>
            <th>VIP</th>
            <th>余额</th>
            <th>上限</th>
            <th>累充</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.email }}</td>
            <td>{{ vipLabel(u.vip_level) }}</td>
            <td>¥{{ yuan(u.balance_cents) }}</td>
            <td>¥{{ yuan(u.balance_cap_cents) }}</td>
            <td>¥{{ yuan(u.cumulative_recharge_cents) }}</td>
            <td>
              <button class="btn btn-ghost" type="button" @click="fillCredit(u)">加额</button>
            </td>
          </tr>
          <tr v-if="!users.length">
            <td colspan="7" class="empty">暂无用户</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue'
import { api } from '@/api'

export default {
  name: 'AdminUsers',
  setup() {
    const users = ref([])
    const q = ref('')
    const crediting = ref(false)
    const creditMsg = ref('')
    const creditErr = ref(false)
    const creditForm = reactive({ email: '', yuan: 7 })

    function yuan(cents) {
      return (Number(cents || 0) / 100).toFixed(2)
    }

    function vipLabel(level) {
      if (!level) return '普通'
      return `VIP${level}`
    }

    async function load() {
      const res = await api.listUsers({ q: q.value })
      users.value = res.users || []
    }

    function fillCredit(u) {
      creditForm.email = u.email
      creditMsg.value = ''
    }

    async function credit() {
      creditMsg.value = ''
      creditErr.value = false
      const yuanVal = Number(creditForm.yuan)
      if (!creditForm.email || !(yuanVal > 0)) {
        creditErr.value = true
        creditMsg.value = '请填写邮箱与正数金额'
        return
      }
      const amount_cents = Math.round(yuanVal * 100)
      crediting.value = true
      try {
        const res = await api.adminCredit({
          email: creditForm.email.trim(),
          amount_cents
        })
        const u = res.user
        creditMsg.value = `已加额 ¥${yuan(res.credited_cents)}；当前余额 ¥${yuan(u.balance_cents)}，${vipLabel(u.vip_level)}` +
          (res.vip_bonus_cents ? `（升档补 ¥${yuan(res.vip_bonus_cents)}）` : '')
        await load()
      } catch (e) {
        creditErr.value = true
        creditMsg.value = e.message || '加额失败'
      } finally {
        crediting.value = false
      }
    }

    onMounted(load)
    return {
      users,
      q,
      creditForm,
      crediting,
      creditMsg,
      creditErr,
      yuan,
      vipLabel,
      load,
      fillCredit,
      credit
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
h2 {
  font-size: 1.15rem;
  margin-bottom: 8px;
}
.search {
  display: flex;
  gap: 8px;
}
.search input {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 12px;
  min-width: 200px;
}
.credit-panel {
  padding: 18px;
  margin-bottom: 16px;
}
.hint {
  margin: 0 0 12px;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.credit-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}
.field {
  display: grid;
  gap: 4px;
}
.field label {
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.field input {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 12px;
  min-width: 180px;
}
.msg {
  margin: 12px 0 0;
  color: var(--accent);
  font-size: 0.92rem;
}
.msg.err {
  color: var(--hot);
}
.table-wrap {
  overflow-x: auto;
  padding: 0;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}
.table th, .table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
  text-align: left;
}
.table th {
  color: var(--ink-soft);
  font-weight: 600;
}
.empty {
  color: var(--ink-soft);
  text-align: center;
}
</style>
