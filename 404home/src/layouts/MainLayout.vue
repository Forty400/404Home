<template>
  <div class="layout">
    <AppHeader />
    <main>
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

export default {
  name: 'MainLayout',
  components: { AppHeader, AppFooter }
}
</script>
