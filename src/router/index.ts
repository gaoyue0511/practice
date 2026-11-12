// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const routes: Array<RouteRecordRaw> = [
  // 首页（根路径）
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },

  // 登录页
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },

  // 用户管理页
  {
    path: '/user-management',
    name: 'UserManagement',
    component: () => import('../views/UserManagement.vue')
  },

  // 我的收藏页
  {
    path: '/collections',
    name: 'MyCollections',
    component: () => import('../views/MyCollections.vue')
  },

  // 忘记密码页
  {
    path: '/forgot-password',
    name: 'forgotPassword',
    component: () => import('../views/ForgotPasswordView.vue')
  },

  // 注册页
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue')
  },

  // 色彩库页
  {
    path: '/color-library',
    name: 'ColorLibrary',
    component: () => import('../views/ColorLibrary.vue')
  },

  // 智能配色生成页
  {
    path: '/color-generate',
    name: 'ColorGenerate',
    component: () => import('../views/ColorGenerate.vue'),
    meta: { requiresAuth: true }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// 检查是否已登录
const isLoggedIn = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
  return !!(token && userInfo)
}

// 路由前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/login')
  } else {
    next()
  }
})

// 路由加载日志
try {
  router.afterEach((to, from) => {
    console.log(`路由切换：${from.path} → ${to.path}，匹配组件：${to.name}`)
  })
} catch (error) {
  console.error('路由afterEach钩子错误：', error)
}

// 路由错误捕获
try {
  router.onError((err) => {
    console.error('路由加载错误：', err)
  })
} catch (error) {
  console.error('路由onError钩子错误：', error)
}

export default router