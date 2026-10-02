import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/api'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/Home.vue') },
      { path: 'category/:slug', name: 'category', component: () => import('@/views/Category.vue') },
      { path: 'tool/:slug', name: 'tool-detail', component: () => import('@/views/ToolDetail.vue') },
      { path: 'search', name: 'search', component: () => import('@/views/Search.vue') },
      { path: 'news', name: 'news', component: () => import('@/views/News.vue') },
      { path: 'news/:id', name: 'news-detail', component: () => import('@/views/PostDetail.vue'), props: { postType: 'news' } },
      { path: 'tutorials', name: 'tutorials', component: () => import('@/views/Tutorials.vue') },
      { path: 'tutorials/:id', name: 'tutorial-detail', component: () => import('@/views/PostDetail.vue'), props: { postType: 'tutorial' } },
      { path: 'about', name: 'about', component: () => import('@/views/About.vue') }
    ]
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/Login.vue')
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'tools', name: 'admin-tools', component: () => import('@/views/admin/Tools.vue') },
      { path: 'categories', name: 'admin-categories', component: () => import('@/views/admin/Categories.vue') },
      { path: 'posts', name: 'admin-posts', component: () => import('@/views/admin/Posts.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (to.matched.some((r) => r.meta.requiresAuth) && !getToken()) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
