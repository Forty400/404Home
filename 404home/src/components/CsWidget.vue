<template>
  <div class="cs-root">
    <button
      v-show="!open"
      class="cs-fab"
      type="button"
      aria-label="打开客服"
      @click="openWidget"
    >
      客服
    </button>

    <div v-if="open" class="cs-backdrop" @click="closeWidget" />

    <aside v-if="open" class="cs-panel" role="dialog" aria-label="在线客服">
      <header class="cs-head">
        <div>
          <strong>在线客服</strong>
          <span v-if="displayName" class="cs-sub">{{ displayName }}</span>
        </div>
        <button class="cs-icon" type="button" aria-label="关闭" @click="closeWidget">×</button>
      </header>

      <div ref="listEl" class="cs-body">
        <p v-if="loading" class="cs-muted">连接中…</p>
        <p v-else-if="error" class="cs-err">{{ error }}</p>
        <template v-else>
          <div
            v-for="m in messages"
            :key="m.id"
            class="cs-msg"
            :class="m.role"
          >
            <span class="cs-bubble">{{ m.content }}</span>
          </div>
        </template>
      </div>

      <div v-if="faqs.length" class="cs-faqs">
        <button
          v-for="f in faqs"
          :key="f.id"
          type="button"
          class="cs-chip"
          :disabled="sending"
          @click="send(f.label)"
        >
          {{ f.label }}
        </button>
        <button type="button" class="cs-chip accent" :disabled="sending" @click="transfer">
          转人工
        </button>
      </div>
      <div v-else class="cs-faqs">
        <button type="button" class="cs-chip accent" :disabled="sending" @click="transfer">
          转人工
        </button>
      </div>

      <form class="cs-input" @submit.prevent="send()">
        <input v-model="draft" placeholder="输入消息…" :disabled="sending" />
        <button class="btn btn-primary" type="submit" :disabled="sending || !draft.trim()">
          发送
        </button>
      </form>
    </aside>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import { useCsWidget } from '@/composables/useCsWidget'

export default {
  name: 'CsWidget',
  setup() {
    const listEl = ref(null)
    const cs = useCsWidget()

    watch(
      () => cs.messages.value.length,
      async () => {
        await nextTick()
        if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight
      }
    )

    return { listEl, ...cs }
  }
}
</script>

<style scoped>
.cs-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 40;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: var(--on-accent);
  box-shadow: var(--shadow);
  cursor: pointer;
  font-weight: 600;
}

.cs-backdrop {
  display: none;
}

.cs-panel {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 41;
  width: min(360px, calc(100vw - 24px));
  height: min(520px, calc(100vh - 48px));
  background: var(--bg-elevated);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
}

.cs-sub {
  display: block;
  font-size: 0.75rem;
  color: var(--ink-soft);
  font-weight: 400;
}

.cs-icon {
  border: none;
  background: transparent;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  color: var(--ink-soft);
}

.cs-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cs-msg {
  display: flex;
}

.cs-msg.user {
  justify-content: flex-end;
}

.cs-bubble {
  max-width: 85%;
  padding: 8px 10px;
  border-radius: 12px;
  background: var(--accent-soft);
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.cs-msg.user .cs-bubble {
  background: var(--accent);
  color: var(--on-accent);
}

.cs-msg.system .cs-bubble {
  background: transparent;
  color: var(--ink-soft);
  font-size: 0.8rem;
  text-align: center;
  max-width: 100%;
  width: 100%;
}

.cs-faqs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid var(--line);
}

.cs-chip {
  border: 1px solid var(--line);
  background: var(--bg);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.8rem;
  cursor: pointer;
}

.cs-chip.accent {
  border-color: var(--accent);
  color: var(--accent);
}

.cs-input {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--line);
}

.cs-input input {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 10px;
  background: var(--bg);
}

.cs-muted,
.cs-err {
  color: var(--ink-soft);
  font-size: 0.9rem;
}

.cs-err {
  color: var(--hot);
}

@media (max-width: 640px) {
  .cs-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(15, 23, 42, 0.35);
  }

  .cs-panel {
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: min(70vh, 560px);
    border-radius: 16px 16px 0 0;
  }

  .cs-fab {
    right: 16px;
    bottom: 16px;
  }
}
</style>
