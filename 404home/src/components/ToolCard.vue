<template>
  <article class="tool-card card-panel">
    <RouterLink class="main-link" :to="`/tool/${tool.slug}`">
      <div class="top">
        <div class="icon" aria-hidden="true">{{ initials }}</div>
        <div class="meta">
          <h3>
            {{ tool.name }}
            <span v-if="tool.is_hot" class="badge badge-hot">热门</span>
            <span v-if="tool.is_new" class="badge badge-new">新</span>
          </h3>
          <p>{{ tool.summary }}</p>
        </div>
      </div>
    </RouterLink>
    <div class="bottom">
      <div class="tags">
        <span v-for="tag in tool.tags || []" :key="tag">{{ tag }}</span>
      </div>
      <a
        class="btn btn-ghost"
        :href="tool.url"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >访问</a>
    </div>
  </article>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ToolCard',
  props: {
    tool: { type: Object, required: true }
  },
  setup(props) {
    const initials = computed(() => {
      const name = props.tool.name || '?'
      return name.slice(0, 1).toUpperCase()
    })
    return { initials }
  }
}
</script>

<style scoped>
.tool-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  min-height: 168px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.main-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.top {
  display: flex;
  gap: 12px;
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-display);
  font-weight: 700;
  flex: 0 0 auto;
}

.meta h3 {
  margin: 0 0 6px;
  font-size: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.meta p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.88rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bottom {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tags span {
  font-size: 0.72rem;
  color: var(--ink-soft);
  background: color-mix(in srgb, var(--ink) 5%, transparent);
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
}

.btn {
  flex: 0 0 auto;
  padding: 0.35rem 0.8rem;
  font-size: 0.84rem;
}
</style>
