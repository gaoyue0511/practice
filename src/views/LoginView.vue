<template>
  <!-- 登录页面容器（全屏背景） -->
  <div class="login-container" @mousemove="handleMouseMove">
    <!-- 背景纹理层 -->
    <div class="bg-texture"></div>
    
    <!-- 互动式背景装饰 -->
    <div class="bg-decoration">
      <!-- 跟随鼠标的渐变光晕 -->
      <div 
        class="mouse-follower" 
        :style="{ left: `${mouseX}px`, top: `${mouseY}px` }"
      ></div>
      
      <!-- 漂浮粒子装饰 -->
      <div 
        class="decor-particle" 
        v-for="i in 8" 
        :key="i" 
        :style="particleStyles(i)"
      ></div>
    </div>
    
    <!-- 登录卡片 -->
    <div class="login-card">
      <h2 class="login-title">智能配色工坊</h2>
      <p class="login-subtitle">请登录你的账号</p>

      <!-- 登录表单 -->
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- 可选修改：标签文案从“用户名/邮箱”改为“用户ID/邮箱” -->
        <div class="form-group">
          <label for="username">用户ID/邮箱</label>
          <input
            type="text"
            id="username"
            v-model.trim="form.username"
            @blur="validateField('username')"
            :class="{ 'invalid': formErrors.username }"
            placeholder="请输入用户ID或邮箱"
          >
          <p class="error-message">{{ formErrors.username }}</p>
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model.trim="form.password"
            @blur="validateField('password')"
            :class="{ 'invalid': formErrors.password }"
            placeholder="请输入密码"
          >
          <p class="error-message">{{ formErrors.password }}</p>
        </div>

        <!-- 记住密码 & 忘记密码 -->
        <div class="form-actions">
          <label class="remember-me">
            <input type="checkbox" v-model="form.remember">
            <span>记住我</span>
          </label>
        </div>

        <!-- 登录按钮 -->
        <button 
          type="submit" 
          class="login-btn"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">登录</span>
          <span v-else>登录中...</span>
        </button>

        <!-- 注册入口 -->
        <div class="register-link">
          还没有账号？
          <router-link to="/register">立即注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// 1. 注入全局更新方法（核心：登录后直接更新导航栏状态）
const updateUserState = inject<(token: string, user: any) => void>('updateUserState')!

// 2. 封装axios请求实例
const request = axios.create({
  baseURL: 'http://localhost:3000', // 后端接口地址（本地开发）
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器：统一处理后端返回的错误
request.interceptors.response.use(
  (response) => response.data, // 直接返回响应体
  (error) => {
    return Promise.reject(error)
  }
)

// 3. 核心数据定义
const form = reactive({
  username: '',
  password: '',
  remember: false
})

// 错误信息
const formErrors = reactive({
  username: '',
  password: ''
})

// 状态管理
const isLoading = ref(false)
const router = useRouter()

// 鼠标互动相关
const mouseX = ref(0)
const mouseY = ref(0)
const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

// 4. 装饰粒子样式
const particleStyles = (i: number) => {
  const colors = ['#f87171', '#fb923c', '#38bdf8', '#a78bfa', '#4ade80']
  const size = Math.random() * 60 + 20
  const posX = Math.random() * 100
  const posY = Math.random() * 100
  const delay = Math.random() * 8
  const duration = Math.random() * 40 + 30
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${posX}%`,
    top: `${posY}%`,
    backgroundColor: colors[i % colors.length],
    '--color': colors[i % colors.length],
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}

// 5. 表单验证
const validateField = (field: keyof typeof form) => {
  switch (field) {
    case 'username':
      if (!form.username) {
        formErrors.username = '用户ID/邮箱不能为空'
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.username) && 
                 !/^[a-zA-Z0-9_]{3,16}$/.test(form.username)) {
        formErrors.username = '请输入有效的用户ID或邮箱'
      } else {
        formErrors.username = ''
      }
      break
    case 'password':
      if (!form.password) {
        formErrors.password = '密码不能为空'
      } else if (form.password.length < 6) {
        formErrors.password = '密码长度不能少于6位'
      } else {
        formErrors.password = ''
      }
      break
  }
}

// 整体表单验证
const validateForm = (): boolean => {
  let isValid = true
  Object.keys(form)
    .filter(key => key !== 'remember')
    .forEach(key => {
      validateField(key as keyof typeof form)
      if (formErrors[key as keyof typeof formErrors]) {
        isValid = false
      }
    })
  return isValid
}

// 6. 登录处理（核心修改：主动更新全局状态）
const handleLogin = async () => {
  // 1. 前端表单验证
  if (!validateForm()) return

  // 2. 发送登录请求到后端
  isLoading.value = true
  try {
    console.log('登录请求参数：', form) // 调试日志
    // 调用后端登录接口：POST /api/login
    const res = await request.post('/api/login', {
      username: form.username,
      password: form.password,
      remember: form.remember
    })

    console.log('登录成功返回：', res) // 调试日志
    // 3. 核心：主动更新全局状态（导航栏立即生效）
    const { token, user } = res.data
    updateUserState(token, { ...user, remember: form.remember })

    // 4. 跳转到首页
    router.push('/')

  } catch (error) {
    console.error('登录失败详情：', error)
    // 显示后端返回的错误信息（密码错误/用户不存在）
    const errMsg = error.response?.data?.msg || error.message || '登录失败'
    alert(errMsg)
  } finally {
    isLoading.value = false
  }
}

// 7. 已登录用户自动跳转
onMounted(() => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    router.push('/')
  }
})
</script>

<style scoped>
/* 样式部分完全不变 */
:global(html), :global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
}

.login-container {
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  background-color: #000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 15px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.bg-texture {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 1;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.mouse-follower {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(248,113,113,0.1) 0%, transparent 70%);
  filter: blur(40px);
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: all 0.2s ease-out;
  z-index: 0;
}

.decor-particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color) 0%, rgba(255,255,255,0) 70%);
  filter: blur(15px);
  opacity: 0.3;
  animation: float 45s infinite ease-in-out;
  pointer-events: none;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.2;
  }
  25% {
    transform: translateY(-15px) rotate(45deg);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-8px) rotate(90deg);
    opacity: 0.3;
  }
  75% {
    transform: translateY(-12px) rotate(135deg);
    opacity: 0.5;
  }
}

.login-card {
  width: 100%;
  max-width: 400px;
  max-height: calc(100vh - 30px);
  margin-top: 8vh;
  background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  padding: 2rem 1.5rem;
  box-sizing: border-box;
  backdrop-filter: blur(12px);
  position: relative;
  z-index: 2;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.login-card::-webkit-scrollbar {
  display: none;
}

.login-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.6rem;
  text-align: center;
  font-weight: 700;
  background: linear-gradient(130deg, #fff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
}

.login-subtitle {
  margin: 0 0 1.5rem 0;
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
  font-weight: 500;
}

.form-group input {
  height: 45px;
  padding: 0 0.8rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  font-size: 0.9rem;
  color: #fff;
  transition: all 0.3s ease;
}

.form-group input::placeholder {
  color: rgba(255,255,255,0.4);
}

.form-group input:focus {
  outline: none;
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(248,113,113,0.1);
  background: rgba(255,255,255,0.08);
}

.form-group input.invalid {
  border-color: #f87171;
}

.error-message {
  margin: 0;
  color: #f87171;
  font-size: 0.8rem;
  height: 16px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  accent-color: #f87171;
}

.forgot-link {
  color: #f87171;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.forgot-link:hover {
  color: #fb923c;
  text-decoration: underline;
}

.login-btn {
  height: 48px;
  background: linear-gradient(90deg, #f87171, #fb923c);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.3rem;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.6s ease;
}

.login-btn:hover:not(:disabled)::before {
  left: 100%;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(248,113,113,0.2);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.register-link {
  margin-top: 0.8rem;
  text-align: center;
  color: rgba(255,255,255,0.7);
  font-size: 0.8rem;
}

.register-link a {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #60a5fa;
  text-decoration: underline;
}
</style>