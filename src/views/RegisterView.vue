<template>
  <!-- 模板部分：仅调整标签文案（用户名 → 用户ID，匹配后端字段） -->
  <div class="register-container" @mousemove="handleMouseMove">
    <div class="bg-texture"></div>
    <div class="bg-decoration">
      <div class="mouse-follower" :style="{ left: `${mouseX}px`, top: `${mouseY}px` }"></div>
      <div class="decor-particle" v-for="i in 8" :key="i" :style="particleStyles(i)"></div>
    </div>
    <div class="register-card">
      <h2 class="register-title">智能配色工坊</h2>
      <p class="register-subtitle">创建你的账号</p>
      <form class="register-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <!-- 关键修改1：标签文案从“用户名”改为“用户ID”，匹配后端user_id字段 -->
          <label for="username">用户ID</label>
          <input 
            type="text" 
            id="username" 
            v-model.trim="form.user_id" 
            placeholder="3-16位字母/数字/下划线"
            @blur="validateUserId"
          >
          <p class="error-message">{{ errorMsg.user_id }}</p>
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model.trim="form.email" 
            placeholder="请输入邮箱"
            @blur="validateEmail"
          >
          <p class="error-message">{{ errorMsg.email }}</p>
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model.trim="form.password" 
            placeholder="至少6位"
            @blur="validatePassword"
          >
          <p class="error-message">{{ errorMsg.password }}</p>
        </div>
        <div class="form-group">
          <label for="confirmPwd">确认密码</label>
          <input 
            type="password" 
            id="confirmPwd" 
            v-model.trim="form.confirmPwd" 
            placeholder="再次输入密码"
            @blur="validateConfirmPwd"
          >
          <p class="error-message">{{ errorMsg.confirmPwd }}</p>
        </div>
        <button type="submit" class="register-btn" :disabled="isLoading">
          <span v-if="!isLoading">注册</span>
          <span v-else>注册中...</span>
        </button>
        <div class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// 1. 配置axios请求实例（保持不变）
const request = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// 响应拦截器优化：区分不同错误类型
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errMsg = '网络异常，请稍后重试'
    if (error.response) {
      // 后端返回的错误
      errMsg = error.response.data.msg || error.response.data.message || errMsg
    } else if (error.request) {
      // 无响应（后端未启动/跨域）
      errMsg = '无法连接到服务器，请检查后端是否启动'
    }
    alert(errMsg)
    return Promise.reject(error)
  }
)

// 2. 核心数据定义
// 关键修改2：表单字段从username改为user_id（匹配后端表字段）
const form = reactive({
  user_id: '',    // 对应后端的user_id
  email: '',
  password: '',
  confirmPwd: ''
})

// 错误提示精细化
const errorMsg = reactive({
  user_id: '',
  email: '',
  password: '',
  confirmPwd: ''
})

const isLoading = ref(false)
const router = useRouter()

// 鼠标互动逻辑（保持不变）
const mouseX = ref(0)
const mouseY = ref(0)
const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

// 装饰粒子样式（保持不变）
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

// 3. 精细化表单验证
const validateUserId = () => {
  if (!form.user_id) {
    errorMsg.user_id = '用户ID不能为空'
  } else if (!/^[a-zA-Z0-9_]{3,16}$/.test(form.user_id)) {
    errorMsg.user_id = '用户ID需为3-16位字母/数字/下划线'
  } else {
    errorMsg.user_id = ''
  }
}

const validateEmail = () => {
  if (!form.email) {
    errorMsg.email = '邮箱不能为空'
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
    errorMsg.email = '请输入有效的邮箱地址'
  } else {
    errorMsg.email = ''
  }
}

const validatePassword = () => {
  if (!form.password) {
    errorMsg.password = '密码不能为空'
  } else if (form.password.length < 6) {
    errorMsg.password = '密码长度不能少于6位'
  } else {
    errorMsg.password = ''
  }
}

const validateConfirmPwd = () => {
  if (form.confirmPwd !== form.password) {
    errorMsg.confirmPwd = '两次密码输入不一致'
  } else {
    errorMsg.confirmPwd = ''
  }
}

// 整体表单验证
const validateForm = (): boolean => {
  validateUserId()
  validateEmail()
  validatePassword()
  validateConfirmPwd()
  
  // 检查是否有错误
  return !Object.values(errorMsg).some(msg => msg)
}

// 4. 注册处理逻辑
const handleRegister = async () => {
  if (!validateForm()) return

  isLoading.value = true
  try {
    // 关键修改3：请求参数改为user_id（匹配后端接口）
    await request.post('/api/register', {
      user_id: form.user_id,   // 对应后端的user_id字段
      email: form.email,
      password: form.password,
      nickname: form.user_id   // 昵称默认用用户ID
    })

    alert('注册成功！即将跳转到登录页')
    router.push('/login')

  } catch (error) {
    console.error('注册失败详情：', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 新增错误提示样式 */
.error-message {
  margin: 0;
  color: #f87171;
  font-size: 0.8rem;
  height: 16px;
}

/* 原有样式保持不变 */
:global(html), :global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden !important;
}

.register-container {
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
  overflow: hidden !important;
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

.register-card {
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

.register-card::-webkit-scrollbar {
  display: none;
}

.register-title {
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

.register-subtitle {
  margin: 0 0 1.5rem 0;
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  text-align: center;
}

.register-form {
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

.register-btn {
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

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.6s ease;
}

.register-btn:hover:not(:disabled)::before {
  left: 100%;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(248,113,113,0.2);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-link {
  margin-top: 0.8rem;
  text-align: center;
  color: rgba(255,255,255,0.7);
  font-size: 0.8rem;
}

.login-link a {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: #60a5fa;
  text-decoration: underline;
}
</style>