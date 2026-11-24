import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/api'
import { useAuthModal } from '@/composables/useAuthModal'
import { trackPageview } from '@/composables/usePageview'
import { resolveDocumentTitle } from '@/utils/documentTitle'

const { openLogin, openRegister } = useAuthModal()

function safeRedirect(queryRedirect) {
  if (typeof queryRedirect === 'string' && queryRedirect.startsWith('/') && !queryRedirect.startsWith('//')) {
    if (queryRedirect === '/login' || queryRedirect === '/register') return '/'
    return queryRedirect
  }
  return '/'
}

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        meta: { title: 'AI 内容站' },
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'category/:slug',
        name: 'category',
        meta: { title: '工具分类' },
        component: () => import('@/views/Category.vue')
      },
      {
        path: 'tool/:slug',
        name: 'tool-detail',
        meta: { title: '工具详情' },
        component: () => import('@/views/ToolDetail.vue')
      },
      {
        path: 'search',
        name: 'search',
        meta: { title: '搜索工具' },
        component: () => import('@/views/Search.vue')
      },
      {
        path: 'smart-search',
        name: 'smart-search',
        meta: { title: '智能检索' },
        component: () => import('@/views/SmartSearch.vue')
      },
      {
        path: 'news',
        name: 'news',
        meta: { title: '每日资讯' },
        component: () => import('@/views/News.vue')
      },
      {
        path: 'news/:id',
        name: 'news-detail',
        meta: { title: '资讯' },
        component: () => import('@/views/PostDetail.vue'),
        props: { postType: 'news' }
      },
      {
        path: 'tutorials',
        name: 'tutorials',
        meta: { title: '教程资源' },
        component: () => import('@/views/Tutorials.vue')
      },
      {
        path: 'tutorials/:id',
        name: 'tutorial-detail',
        meta: { title: '教程' },
        component: () => import('@/views/PostDetail.vue'),
        props: { postType: 'tutorial' }
      },
      {
        path: 'about',
        name: 'about',
        meta: { title: '关于' },
        component: () => import('@/views/About.vue')
      },
      {
        path: 'trial',
        name: 'trial',
        meta: { title: 'DeepSeek 试用' },
        component: () => import('@/views/Trial.vue')
      },
      { path: 'login', name: 'user-login', component: () => import('@/views/user/Login.vue') },
      { path: 'register', name: 'user-register', component: () => import('@/views/user/Register.vue') }
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
      { path: 'posts', name: 'admin-posts', component: () => import('@/views/admin/Posts.vue') },
      {
        path: 'posts/review',
        name: 'admin-posts-review',
        component: () => import('@/views/admin/PostReview.vue')
      },
      {
        path: 'posts/editor',
        name: 'admin-posts-editor',
        component: () => import('@/views/admin/PostEditor.vue')
      },
      {
        path: 'posts/trash',
        name: 'admin-posts-trash',
        component: () => import('@/views/admin/PostTrash.vue')
      },
      { path: 'users', name: 'admin-users', component: () => import('@/views/admin/Users.vue') },
      { path: 'chats', name: 'admin-chats', component: () => import('@/views/admin/Chats.vue') },
      { path: 'cs', name: 'admin-cs', component: () => import('@/views/admin/CsWorkbench.vue') }
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
  if (to.name === 'user-login') {
    const redirect = safeRedirect(to.query.redirect)
    openLogin({ redirect })
    return { path: redirect, replace: true }
  }
  if (to.name === 'user-register') {
    const redirect = safeRedirect(to.query.redirect)
    openRegister({ redirect })
    return { path: redirect, replace: true }
  }
  return true
})

router.afterEach((to) => {
  document.title = resolveDocumentTitle(to)
  trackPageview(to.fullPath)
})

export default router
