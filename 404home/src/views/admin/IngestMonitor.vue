<template>
  <div>
    <div class="head">
      <h1>采集机器人</h1>
      <p class="hint">静默只读采集；可启停、改周期与配额，并查看实时进度。</p>
    </div>

    <div class="grid">
      <section class="card-panel panel">
        <h2>开关与立即执行</h2>
        <p class="state">
          状态：
          <strong :class="snap.enabled ? 'on' : 'off'">{{ snap.enabled ? '已开启' : '已关闭' }}</strong>
          · 运行：{{ snap.status?.running ? '进行中' : '空闲' }}
        </p>
        <div class="actions">
          <button class="btn btn-primary" type="button" :disabled="busy" @click="setEnabled(true)">
            开启
          </button>
          <button class="btn btn-ghost" type="button" :disabled="busy" @click="setEnabled(false)">
            关闭
          </button>
          <button class="btn btn-primary" type="button" :disabled="busy || running" @click="runNow(false)">
            立即采集
          </button>
          <button
            class="btn btn-ghost"
            type="button"
            :disabled="busy || running"
            @click="runNow(true)"
          >
            强制采集（忽略关闭）
          </button>
        </div>
        <div class="progress-wrap">
          <div class="progress-label">
            {{ progressLabel }}
          </div>
          <div class="bar" aria-label="采集进度">
            <div class="fill" :style="{ width: progressPct + '%' }" />
          </div>
        </div>
        <p v-if="snap.status?.lastError" class="error">上次错误：{{ snap.status.lastError }}</p>
        <p class="meta">
          上次开始：{{ snap.status?.lastStartedAt || '—' }} · 结束：{{
            snap.status?.lastFinishedAt || '—'
          }}
          · 入库 {{ snap.status?.lastPosted ?? 0 }}（新闻 {{ snap.status?.lastNews ?? 0 }} / GitHub
          {{ snap.status?.lastGithub ?? 0 }}）
        </p>
      </section>

      <section class="card-panel panel">
        <h2>周期与配额</h2>
        <div class="field">
          <label>采集周期（小时）</label>
          <input v-model.number="form.intervalHours" type="number" min="1" max="168" />
          <p class="note">会尽量重配 pm2 cron（24→每天、12→每12小时…）</p>
        </div>
        <div class="field">
          <label>单次总上限 dailyLimit</label>
          <input v-model.number="form.dailyLimit" type="number" min="0" max="50" />
        </div>
        <div class="field">
          <label>新闻条数 newsLimit</label>
          <input v-model.number="form.newsLimit" type="number" min="0" max="50" />
        </div>
        <div class="field">
          <label>GitHub 条数 githubLimit</label>
          <input v-model.number="form.githubLimit" type="number" min="0" max="50" />
        </div>
        <div class="field">
          <label>待审积压上限 pendingLimit</label>
          <input v-model.number="form.pendingLimit" type="number" min="1" max="200" />
        </div>
        <button class="btn btn-primary" type="button" :disabled="busy" @click="saveSettings">
          保存设置
        </button>
      </section>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="ok" class="ok">{{ ok }}</p>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { api } from '@/api'

export default {
  name: 'AdminIngestMonitor',
  setup() {
    const snap = reactive({
      enabled: true,
      intervalHours: 24,
      dailyLimit: 5,
      newsLimit: 3,
      githubLimit: 2,
      pendingLimit: 20,
      status: {}
    })
    const form = reactive({
      intervalHours: 24,
      dailyLimit: 5,
      newsLimit: 3,
      githubLimit: 2,
      pendingLimit: 20
    })
    const busy = ref(false)
    const error = ref('')
    const ok = ref('')
    let timer = null

    const running = computed(() => !!snap.status?.running)
    const progressPct = computed(() => {
      const cur = Number(snap.status?.current) || 0
      const tot = Number(snap.status?.total) || 0
      if (!tot) return running.value ? 8 : 0
      return Math.max(0, Math.min(100, Math.round((cur / tot) * 100)))
    })
    const progressLabel = computed(() => {
      const st = snap.status || {}
      if (st.running) {
        return `${st.phase || 'running'} · ${st.current || 0}/${st.total || 0} · ${st.message || ''}`
      }
      return `${st.phase || 'idle'} · ${st.message || '空闲'}`
    })

    function applySnap(data) {
      Object.assign(snap, data)
      form.intervalHours = data.intervalHours
      form.dailyLimit = data.dailyLimit
      form.newsLimit = data.newsLimit
      form.githubLimit = data.githubLimit
      form.pendingLimit = data.pendingLimit
      snap.status = data.status || {}
    }

    async function refresh() {
      try {
        const data = await api.ingestStatus()
        applySnap(data)
      } catch (e) {
        error.value = e.message
      }
    }

    async function setEnabled(enabled) {
      busy.value = true
      error.value = ''
      ok.value = ''
      try {
        const data = enabled ? await api.ingestEnable() : await api.ingestDisable()
        applySnap(data)
        ok.value = enabled ? '已开启采集' : '已关闭采集'
      } catch (e) {
        error.value = e.message
      } finally {
        busy.value = false
      }
    }

    async function saveSettings() {
      busy.value = true
      error.value = ''
      ok.value = ''
      try {
        const data = await api.ingestSettings({ ...form })
        applySnap(data)
        ok.value = '设置已保存'
      } catch (e) {
        error.value = e.message
      } finally {
        busy.value = false
      }
    }

    async function runNow(force) {
      busy.value = true
      error.value = ''
      ok.value = ''
      try {
        const data = await api.ingestRun({ force })
        applySnap(data)
        ok.value = force ? '已强制启动' : '已启动采集'
      } catch (e) {
        error.value = e.message
      } finally {
        busy.value = false
      }
    }

    onMounted(() => {
      refresh()
      timer = setInterval(refresh, 2000)
    })
    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })

    return {
      snap,
      form,
      busy,
      error,
      ok,
      running,
      progressPct,
      progressLabel,
      setEnabled,
      saveSettings,
      runNow
    }
  }
}
</script>

<style scoped>
.head { margin-bottom: 16px; }
h1 { margin: 0 0 6px; font-family: var(--font-display); }
h2 { margin: 0 0 12px; font-size: 1.05rem; }
.hint { margin: 0; color: var(--ink-soft); font-size: 0.9rem; }
.grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.panel { padding: 18px; display: grid; gap: 12px; }
.state { margin: 0; }
.on { color: #15803d; }
.off { color: #b91c1c; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; }
.field { display: grid; gap: 6px; }
.note { margin: 0; color: var(--ink-soft); font-size: 0.82rem; }
.progress-wrap { display: grid; gap: 6px; }
.progress-label { font-size: 0.86rem; color: var(--ink-soft); word-break: break-all; }
.bar {
  height: 10px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: #2563eb;
  transition: width 0.3s ease;
}
.meta { margin: 0; color: var(--ink-soft); font-size: 0.84rem; }
.error { color: #b91c1c; margin: 0; }
.ok { color: #15803d; margin: 0; }
</style>
