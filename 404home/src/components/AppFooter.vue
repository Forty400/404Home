<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div>
        <strong>404Home</strong>
        <p>个人学习作品集：AI 工具导航与试用演示，按场景整理便于查找。</p>
      </div>
      <div class="links">
        <RouterLink to="/about">关于</RouterLink>
        <RouterLink to="/news">每日资讯</RouterLink>
        <RouterLink to="/tutorials">教程资源</RouterLink>
        <RouterLink to="/trial">DeepSeek 试用</RouterLink>
      </div>
      <p class="note">本站仅作工具导航与信息整理，不代表对第三方产品的背书。使用请遵守各工具官方条款。</p>
      <!-- 对齐知乎等站：版权 + ICP（+ 公安）独立合规行 -->
      <div class="compliance">
        <span>Copyright © {{ year }} 404Home</span>
        <a
          v-if="icp"
          class="beian-link"
          :href="icp.href"
          target="_blank"
          rel="noopener noreferrer"
        >{{ icp.text }}</a>
        <a
          v-if="police"
          class="beian-link"
          :href="police.href"
          target="_blank"
          rel="noopener noreferrer"
        >{{ police.text }}</a>
      </div>
    </div>
  </footer>
</template>

<script>
import { buildIcpLink, buildPoliceLink, siteCompliance } from '@/config/siteCompliance'

export default {
  name: 'AppFooter',
  setup() {
    return {
      icp: buildIcpLink(siteCompliance),
      police: buildPoliceLink(siteCompliance),
      year: new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg-elevated) 70%, transparent);
  padding: 36px 0 48px;
}

.footer-inner {
  display: grid;
  gap: 18px;
}

.footer p {
  margin: 8px 0 0;
  color: var(--ink-soft);
  line-height: 1.6;
  max-width: 52ch;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.links a {
  color: var(--accent);
}

.note {
  font-size: 0.86rem;
}

.compliance {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  font-size: 0.8rem;
  color: var(--ink-soft);
  line-height: 1.5;
}

.beian-link {
  color: inherit;
  text-decoration: none;
}

.beian-link:hover {
  color: var(--accent);
  text-decoration: underline;
}
</style>
