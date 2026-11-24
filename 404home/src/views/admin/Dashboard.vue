<template>
  <div>
    <h1>概览</h1>

    <h2 class="section">访问量</h2>
    <div class="stats">
      <div class="card-panel stat" v-for="item in trafficCards" :key="item.label">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <div class="grid-2">
      <div class="card-panel chart-card">
        <h3>近 {{ traffic.daily.length || 30 }} 日 PV / UV</h3>
        <svg
          v-if="traffic.daily.length"
          class="chart"
          :viewBox="`0 0 ${chartW} ${chartH}`"
          role="img"
          aria-label="访问量趋势"
        >
          <polyline
            fill="none"
            stroke="var(--accent)"
            stroke-width="2"
            :points="linePoints(traffic.daily, 'pv')"
          />
          <polyline
            fill="none"
            stroke="var(--ink-soft)"
            stroke-width="1.5"
            stroke-dasharray="4 3"
            :points="linePoints(traffic.daily, 'uv')"
          />
          <text x="8" y="16" class="legend" fill="var(--accent)">— PV</text>
          <text x="64" y="16" class="legend" fill="var(--ink-soft)">… UV</text>
        </svg>
        <p v-else class="muted">暂无访问数据（前台浏览后会出现）</p>
        <div v-if="traffic.daily.length" class="axis">
          <span>{{ traffic.daily[0]?.day }}</span>
          <span>{{ traffic.daily[traffic.daily.length - 1]?.day }}</span>
        </div>
      </div>

      <div class="card-panel">
        <h3>热门路径（30 日）</h3>
        <table class="table" v-if="traffic.topPaths.length">
          <thead>
            <tr>
              <th>路径</th>
              <th>PV</th>
              <th>UV</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in traffic.topPaths" :key="row.path">
              <td class="path">{{ row.path }}</td>
              <td>{{ row.pv }}</td>
              <td>{{ row.uv }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="muted">暂无</p>
      </div>
    </div>

    <h2 class="section">内容库存</h2>
    <div class="stats">
      <div class="card-panel stat" v-for="item in inventoryCards" :key="item.label">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api'

const chartW = 560
const chartH = 180
const pad = { t: 28, r: 12, b: 12, l: 12 }

export default {
  name: 'AdminDashboard',
  setup() {
    const stats = ref({
      tools: 0,
      categories: 0,
      news: 0,
      tutorials: 0,
      hotTools: 0,
      users: 0
    })
    const traffic = ref({
      today: { pv: 0, uv: 0 },
      days7: { pv: 0, uv: 0 },
      days30: { pv: 0, uv: 0 },
      daily: [],
      topPaths: []
    })

    const inventoryCards = computed(() => [
      { label: 'C 端用户', value: stats.value.users },
      { label: '工具', value: stats.value.tools },
      { label: '分类', value: stats.value.categories },
      { label: '资讯', value: stats.value.news },
      { label: '教程', value: stats.value.tutorials },
      { label: '热门工具', value: stats.value.hotTools }
    ])

    const trafficCards = computed(() => [
      { label: '今日 PV', value: traffic.value.today.pv },
      { label: '今日 UV', value: traffic.value.today.uv },
      { label: '近 7 日 PV', value: traffic.value.days7.pv },
      { label: '近 7 日 UV', value: traffic.value.days7.uv },
      { label: '近 30 日 PV', value: traffic.value.days30.pv },
      { label: '近 30 日 UV', value: traffic.value.days30.uv }
    ])

    function linePoints(rows, key) {
      if (!rows.length) return ''
      const max = Math.max(1, ...rows.map((r) => Number(r[key]) || 0))
      const innerW = chartW - pad.l - pad.r
      const innerH = chartH - pad.t - pad.b
      return rows
        .map((r, i) => {
          const x = pad.l + (rows.length === 1 ? innerW / 2 : (i / (rows.length - 1)) * innerW)
          const y = pad.t + innerH - ((Number(r[key]) || 0) / max) * innerH
          return `${x.toFixed(1)},${y.toFixed(1)}`
        })
        .join(' ')
    }

    onMounted(async () => {
      const [s, t] = await Promise.all([api.getStats(), api.getTraffic({ days: 30 })])
      stats.value = s
      traffic.value = t
    })

    return {
      inventoryCards,
      trafficCards,
      traffic,
      chartW,
      chartH,
      linePoints
    }
  }
}
</script>

<style scoped>
h1 {
  margin: 0 0 18px;
  font-family: var(--font-display);
}
.section {
  margin: 24px 0 12px;
  font-size: 1.05rem;
  color: var(--ink-soft);
  font-weight: 600;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}
.stat {
  padding: 18px;
  display: grid;
  gap: 6px;
}
.stat strong {
  font-size: 1.6rem;
  font-family: var(--font-display);
}
.stat span {
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 12px;
  margin-top: 12px;
}
.chart-card h3,
.card-panel h3 {
  margin: 0 0 10px;
  font-size: 0.95rem;
}
.chart {
  width: 100%;
  height: auto;
  display: block;
  background: var(--bg);
  border-radius: 8px;
}
.legend {
  font-size: 11px;
}
.axis {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--ink-soft);
  margin-top: 6px;
}
.path {
  word-break: break-all;
  font-size: 0.85rem;
}
.muted {
  color: var(--ink-soft);
  font-size: 0.9rem;
}
@media (max-width: 900px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
