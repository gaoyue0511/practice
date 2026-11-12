<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-container">
        <div class="logo">智能配色工坊</div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <!-- 仅未登录时显示登录按钮 -->
          <router-link to="/login" class="nav-link" v-if="!globalState.isLogin">登录</router-link>
          
          <div class="dropdown">
            <div class="dropdown-trigger nav-link">我的</div>
            <div class="dropdown-menu">
              <div class="user-card">
                <div class="avatar-wrapper">
                  <!-- 优化渲染逻辑：v-if/v-else 严谨兜底 -->
                  <div v-if="!globalState.userInfo.avatar" class="avatar">
                    {{ globalState.userInfo.user_id?.slice(0, 1) || globalState.userInfo.nickname?.slice(0, 1) || '游' }}
                  </div>
                  <img 
                    v-else
                    :src="globalState.userInfo.avatar" 
                    alt="用户头像" 
                    class="avatar img-avatar"
                  >
                </div>
                <div class="user-info">
                  <div class="username">{{ globalState.userInfo.nickname || globalState.userInfo.user_id || '游客用户' }}</div>
                  <div class="user-tag">{{ globalState.isLogin ? '已登录' : '未登录' }}</div>
                </div>
              </div>
              
              <div class="menu-list">
                <router-link to="/collections" class="menu-item" v-if="globalState.isLogin">
                  <span class="item-icon">❤️</span>
                  <span class="item-text">我的收藏</span>
                </router-link>
                <router-link to="/user-management" class="menu-item" v-if="globalState.isLogin">
                  <span class="item-icon">⚙️</span>
                  <span class="item-text">用户管理</span>
                </router-link>
                <div class="menu-item logout-item" v-if="globalState.isLogin" @click="handleLogout">
                  <span class="item-icon">🚪</span>
                  <span class="item-text">退出登录</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="router-view-container">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()    
// 1. 定义全局状态（核心：所有组件共享）
const globalState = reactive({
  isLogin: false,
  userInfo: {
    user_id: '',
    nickname: '',
    avatar: '',
    email: ''
  }
})

// 2. 提供全局状态和更新方法（子组件可注入使用）
provide('globalState', globalState)
provide('updateUserState', (token: string, user: any) => {
  // 直接更新全局状态（实时生效）
  globalState.isLogin = true
  globalState.userInfo = {
    user_id: user.user_id || user.username || '',
    nickname: user.nickname || '',
    avatar: user.avatar || '',
    email: user.email || ''
  }
  // 同步存储到本地
  const storage = user.remember ? localStorage : sessionStorage
  storage.setItem('token', token)
  storage.setItem('userInfo', JSON.stringify(globalState.userInfo)) // 存储完整的userInfo
})

// 3. 初始化用户状态（页面刷新/首次加载时）
const initUserState = () => {
  console.log('初始化用户状态：', localStorage.getItem('token'), sessionStorage.getItem('token')) // 调试日志
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const storedUser = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
  
  if (token && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser)
      globalState.isLogin = true
      globalState.userInfo = {
        user_id: parsedUser.user_id || parsedUser.username || '',
        nickname: parsedUser.nickname || '',
        avatar: parsedUser.avatar || '',
        email: parsedUser.email || ''
      }
    } catch (e) {
      console.error('解析用户信息失败:', e)
      clearUserState()
    }
  } else {
    clearUserState()
  }
}

// 4. 清空用户状态
const clearUserState = () => {
  globalState.isLogin = false
  globalState.userInfo = {
    user_id: '',
    nickname: '游客用户',
    avatar: '',
    email: ''
  }
  // 清空存储
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('userInfo')
}

// 5. 退出登录逻辑
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    clearUserState()
    router.push('/login')
  }
}

// 6. 页面加载时初始化（仅执行一次，移除路由跳转后的重复执行）
onMounted(() => {
  initUserState()
  // 移除：router.afterEach(() => { initUserState() })
  // 该逻辑会在每次路由切换时重置全局状态，覆盖最新修改的头像
})
</script>

<style>
/* 样式部分保持不变，无需修改 */
html, body {
  overflow-y: auto !important; /* 强制改为 auto */
  overflow-x: hidden !important;
  height: 100% !important;
}

/* 保持原有样式，但确保滚动正常 */
#app {
  min-height: 100vh;
}

.navbar {
  height: 66px !important; /* 根据控制台输出调整为66px */
}

.router-view-container {
  padding-top: 66px; /* 匹配导航栏高度 */
  min-height: calc(100vh - 66px);
  /* 确保路由内容区域可以正常滚动 */
  overflow-x: hidden;
  overflow-y: visible;
}
.avatar.img-avatar {
  width: 40px;
  height: 40px;
  object-fit: cover;
}
.logout-item {
  cursor: pointer;
}
.logout-item:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #fff;
  padding-left: 1.1rem;
}
.logout-item .item-icon {
  color: #ef4444;
}
.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(10px) scale(0.98);
  min-width: 220px;
  background: linear-gradient(180deg, #1a202c 0%, #111827 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(107, 114, 128, 0.2);
  border-radius: 10px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.03);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0) scale(1);
}
.user-card {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border-bottom: 1px solid rgba(107, 114, 128, 0.15);
  background: rgba(255, 255, 255, 0.02);
}
.avatar-wrapper {
  position: relative;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.08);
}
.user-info .username {
  color: #f9fafb;
  font-weight: 500;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
}
.user-info .user-tag {
  color: #9ca3af;
  font-size: 0.75rem;
  background: rgba(79, 70, 229, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
}
.menu-list {
  padding: 0.5rem 0;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.75rem 1rem;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.2s ease;
}
.menu-item:hover {
  background: rgba(79, 70, 229, 0.12);
  color: #fff;
  padding-left: 1.1rem;
}
.item-icon {
  font-size: 0.9rem;
  width: 18px;
  text-align: center;
  color: #a855f7;
}
.item-text {
  font-size: 0.9rem;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  background-color: #000;
}
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0.8rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}
.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}
.logo {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(130deg, #fff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
  cursor: pointer;
  transition: all 0.3s ease;
}
.logo:hover {
  transform: scale(1.02);
}
.nav-links {
  display: flex;
  gap: 2.5rem;
  align-items: center;
}
.nav-link {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 400;
  position: relative;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
  cursor: pointer;
}
.nav-link:hover {
  color: #fff;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #f87171, #38bdf8);
  transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.nav-link:hover::after {
  width: 100%;
}
.nav-link.router-link-active {
  color: #fff;
}
.nav-link.router-link-active::after {
  width: 100%;
}
.router-view-container {
  padding-top: 80px;
}
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1.5rem;
  }
  .nav-links {
    gap: 1.5rem;
  }
  .logo {
    font-size: 1.3rem;
  }
  .nav-link {
    font-size: 0.9rem;
  }
}
</style>