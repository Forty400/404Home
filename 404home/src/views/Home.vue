<template>
  <div class="page">
    <section class="hero container">
      <p class="eyebrow">AI 工具导航</p>
      <h1>404Home</h1>
      <p class="lead">记录各类常用 AI 工具，按场景分类，快速找到能上手的那一个。</p>
      <SearchBar />
    </section>

    <div class="container home-grid">
      <div class="main-col">
        <section class="block">
          <div class="section-title">
            <h2>热门工具</h2>
          </div>
          <div class="tool-grid">
            <ToolCard v-for="tool in hotTools" :key="tool.id" :tool="tool" />
          </div>
        </section>

        <section class="block">
          <div class="section-title">
            <h2>最新收录</h2>
          </div>
          <div class="tool-grid">
            <ToolCard v-for="tool in newTools" :key="tool.id" :tool="tool" />
            <p v-if="!newTools.length" class="empty">暂无标记为新的工具</p>
          </div>
        </section>

        <section v-for="group in groups" :key="group.id" class="block" :id="group.slug">
          <div class="section-title">
            <h2>{{ group.name }}</h2>
            <RouterLink :to="`/category/${group.slug}`">查看更多</RouterLink>
          </div>
          <div class="tool-grid">
            <ToolCard v-for="tool in group.tools" :key="tool.id" :tool="tool" />
            <p v-if="!group.tools.length" class="empty">该分类暂无工具</p>
          </div>
        </section>
      </div>

      <SidePanel :news="news" :tutorials="tutorials" />
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { api } from '@/api'
import SearchBar from '@/components/SearchBar.vue'
import ToolCard from '@/components/ToolCard.vue'
import SidePanel from '@/components/SidePanel.vue'

export default {
  name: 'HomeView',
  components: { SearchBar, ToolCard, SidePanel },
  setup() {
    const hotTools = ref([])
    const newTools = ref([])
    const groups = ref([])
    const news = ref([])
    const tutorials = ref([])

    onMounted(async () => {
      try {
        const [hot, newest, grouped, newsList, tutorialList] = await Promise.all([
          api.getTools({ hot: 1, pageSize: 8 }),
          api.getTools({ newest: 1, pageSize: 8 }),
          api.getGroupedTools(),
          api.getPosts({ type: 'news' }),
          api.getPosts({ type: 'tutorial' })
        ])
        hotTools.value = hot.items
        newTools.value = newest.items
        groups.value = grouped.filter((g) => g.tools.length)
        news.value = newsList.slice(0, 5)
        tutorials.value = tutorialList.slice(0, 5)
      } catch (e) {
        console.error(e)
      }
    })

    return { hotTools, newTools, groups, news, tutorials }
  }
}
</script>

<style scoped>
.hero {
  padding: 36px 0 20px;
  display: grid;
  gap: 12px;
  justify-items: start;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.78rem;
  font-weight: 600;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 6vw, 4.2rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
}

.lead {
  margin: 0 0 8px;
  max-width: 36ch;
  color: var(--ink-soft);
  font-size: 1.05rem;
  line-height: 1.6;
}

.home-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 22px;
  align-items: start;
  margin-top: 18px;
}

.main-col {
  display: grid;
  gap: 34px;
}

.block {
  scroll-margin-top: 120px;
}

@media (max-width: 960px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
}
</style>
