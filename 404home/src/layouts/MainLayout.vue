<template>
  <div class="layout">
    <AppHeader />
    <main>
      <RouterView />
    </main>
    <AppFooter />
    <AuthModal />
    <CsWidget />
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import AuthModal from '@/components/AuthModal.vue'
import CsWidget from '@/components/CsWidget.vue'

export default {
  name: 'MainLayout',
  components: { AppHeader, AppFooter, AuthModal, CsWidget }
}
</script>
