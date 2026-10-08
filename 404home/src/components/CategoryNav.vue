<template>
  <div class="cat-nav-wrap" v-if="categories.length">
    <nav ref="navEl" class="cat-nav" :class="{ expanded }">
      <RouterLink
        v-for="cat in categories"
        :key="cat.id"
        :to="`/category/${cat.slug}`"
        class="cat-item"
      >
        {{ cat.name.replace(/^AI/, '') }}
      </RouterLink>
    </nav>
    <button
      v-if="canExpand"
      type="button"
      class="cat-expand"
      :aria-expanded="expanded ? 'true' : 'false'"
      :aria-label="expanded ? '收起分类' : '展开更多分类'"
      @click="expanded = !expanded"
    >
      <span class="cat-expand-icon" :class="{ open: expanded }" aria-hidden="true" />
    </button>
  </div>
</template>

<script>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export default {
  name: 'CategoryNav',
  props: {
    categories: { type: Array, default: () => [] }
  },
  setup(props) {
    const navEl = ref(null)
    const expanded = ref(false)
    const canExpand = ref(false)
    let ro = null

    function measure() {
      const el = navEl.value
      if (!el) {
        canExpand.value = false
        return
      }
      if (expanded.value) {
        /* keep button while expanded so user can collapse */
        canExpand.value = true
        return
      }
      canExpand.value = el.scrollWidth > el.clientWidth + 1
    }

    onMounted(async () => {
      await nextTick()
      measure()
      if (typeof ResizeObserver !== 'undefined' && navEl.value) {
        ro = new ResizeObserver(() => measure())
        ro.observe(navEl.value)
      }
      window.addEventListener('resize', measure)
    })

    onBeforeUnmount(() => {
      if (ro) ro.disconnect()
      window.removeEventListener('resize', measure)
    })

    watch(
      () => props.categories,
      async () => {
        expanded.value = false
        await nextTick()
        measure()
      },
      { deep: true }
    )

    watch(expanded, async () => {
      await nextTick()
      measure()
    })

    return { navEl, expanded, canExpand }
  }
}
</script>

<style scoped>
.cat-nav-wrap {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 0 0 12px;
}

.cat-nav {
  display: flex;
  flex: 1;
  min-width: 0;
  gap: 8px;
  flex-wrap: nowrap;
  overflow: hidden;
}

.cat-nav.expanded {
  flex-wrap: wrap;
  overflow: visible;
}

.cat-item {
  flex: 0 0 auto;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--bg-elevated);
  color: var(--ink-soft);
  font-size: 0.82rem;
  white-space: nowrap;
}

.cat-item.router-link-active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.cat-expand {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  margin-top: 0;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--bg-elevated);
  color: var(--ink-soft);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.cat-expand:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}

.cat-expand-icon {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid currentColor;
  transition: transform 0.18s ease;
}

.cat-expand-icon.open {
  transform: rotate(180deg);
}
</style>
