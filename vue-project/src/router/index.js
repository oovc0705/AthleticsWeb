import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresSearchClear: false } // 首页不需要清空搜索
    },
    {
      path: '/athletes',
      name: 'athletes',
      component: () => import('../views/AthletesView.vue'),
      meta: { requiresSearchClear: true } 
    },
    {
      path: '/athletes/:id',
      name: 'athleteDetail',
      component: () => import('../views/AthleteDetailView.vue'),
      meta: { requiresSearchClear: true }
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('../views/EventsView.vue'),
      meta: { requiresSearchClear: true } // 赛事页需要清空搜索
    },
    {
      path: '/events/:id',
      name: 'eventDetail',
      component: () => import('../views/EventDetailView.vue'),
      meta: { requiresSearchClear: true }
    },
    {
      path: '/events/:eventId/schedules/:scheduleId/results',
      name: 'eventResults',
      component: () => import('../views/EventResultView.vue'),
      meta: { requiresSearchClear: true }
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('../views/NewsView.vue'),
      meta: { requiresSearchClear: true } // 新闻页需要清空搜索
    },
    {
      path: '/news/:id',
      name: 'newsDetail',
      component: () => import('../views/NewsDetailView.vue'),
      meta: { requiresSearchClear: true } // 新闻详情页需要清空搜索
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresSearchClear: true } // 关于页需要清空搜索
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchResults.vue'),
      meta: { requiresSearchClear: false } // 搜索页本身不需要清空
    },
    // 用户相关路由
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/UserProfile.vue'),
      meta: { requiresSearchClear: true }
    },
    // 管理员相关路由
    {
      path: '/admin/login',
      name: 'adminLogin',
      component: () => import('../views/AdminLogin.vue'),
      meta: { requiresSearchClear: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminCenter.vue'),
      meta: { requiresSearchClear: true }
    }
  ],
})

// 全局前置守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/admin/login')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && (!userStore.isLoggedIn || !userStore.isAdmin)) {
    next('/admin/login')
    return
  }
  
  next()
})

// 全局后置守卫 - 路由变化时处理搜索状态
router.afterEach((to, from) => {
  // 如果目标路由需要清空搜索，且当前有搜索状态，则触发清空
  if (to.meta.requiresSearchClear && from.name === 'search') {
    // 这里需要触发搜索栏清空逻辑
    // 实际实现需要在搜索组件中监听路由事件或使用状态管理
    console.log('[Route Guard] Should clear search input for route:', to.path)
  }
})

export default router