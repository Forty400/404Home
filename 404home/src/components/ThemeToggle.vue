<template>
  <button
    type="button"
    class="theme-toggle"
    :title="label"
    :aria-label="label"
    @click="toggle"
  >
    <span class="icon" v-html="icon" />
    <span class="label">{{ label }}</span>
  </button>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import {
  getStoredTheme,
  cycleTheme,
  resolveTheme,
  watchSystem
} from '@/utils/theme'

const ICONS = {
  light: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/><line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/></g></svg>',
  dark: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z" fill="currentColor"/></svg>',
  auto: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/></svg>'
}

const LABELS = { light: '亮色', dark: '暗色', auto: '跟随系统' }

export default {
  name: 'ThemeToggle',
  setup() {
    const stored = ref(getStoredTheme())
    const resolved = ref(resolveTheme(stored.value))

    function refresh() {
      stored.value = getStoredTheme()
      resolved.value = resolveTheme(stored.value)
    }

    function toggle() {
      cycleTheme()
      refresh()
    }

    onMounted(() => {
      watchSystem(refresh)
    })

    const icon = computed(() => {
      // 显示「当前生效态」图标，让用户一眼看出实际是亮还是暗
      return ICONS[stored.value === 'auto' ? resolved.value : stored.value]
    })
    const label = computed(() => {
      const base = LABELS[stored.value]
      if (stored.value === 'auto') {
        return `${base}（当前${resolved.value === 'dark' ? '暗色' : '亮色'}）`
      }
      return base
    })

    return { icon, label, toggle }
  }
}
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  background: var(--bg-elevated);
  color: var(--ink-soft);
  cursor: pointer;
  font-size: 0.8rem;
  transition: 0.18s ease;
}

.theme-toggle:hover {
  color: var(--accent);
  border-color: var(--accent-a25);
}

.icon {
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

.icon :deep(svg) {
  display: block;
}

.label {
  white-space: nowrap;
}

@media (max-width: 520px) {
  .label {
    display: none;
  }
}
</style>
