<template>
  <!-- 模板部分保持不变，无需修改 -->
  <div class="user-container">
    <canvas id="particle-canvas" class="particle-bg"></canvas>
    <aside class="sidebar">
      <div class="user-info">
        <div class="avatar-box">
          <div class="avatar-frame">
            <img :src="userInfo.avatar || defaultAvatar" alt="头像" class="avatar">
            <div class="avatar-overlay" @click="showAvatarModal = true">
              <span>更换</span>
            </div>
          </div>
        </div>
        <h3 class="user-name">{{ userInfo.nickname }}</h3>
        <p class="user-role">{{ userInfo.role }}</p>
      </div>
      <nav class="nav-menu">
        <button class="nav-btn active" disabled>
          <span class="nav-icon">👤</span>
          <span>个人信息</span>
        </button>
      </nav>
      <button class="logout-btn" @click="logout">
        <span class="logout-icon">🚪</span>
        <span>退出登录</span>
      </button>
    </aside>
    <main class="content">
      <div class="content-wrapper">
        <div class="card profile-card">
          <div class="card-header">
            <h2 class="card-title">个人信息设置</h2>
            <p class="card-desc">更新你的个人资料信息，让账号更完善</p>
          </div>
          <form class="profile-form" @submit.prevent="handleSave">
            <div class="form-row">
              <div class="form-item">
                <label class="form-label">用户ID</label>
                <input type="text" v-model="userInfo.username" disabled class="form-input disabled">
              </div>
              <div class="form-item">
                <label class="form-label">昵称</label>
                <input type="text" v-model="userInfo.nickname" required :disabled="!isEditing" class="form-input">
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label class="form-label">邮箱</label>
                <input type="email" v-model="userInfo.email" required :disabled="!isEditing" class="form-input">
              </div>
              <div class="form-item">
                <label class="form-label">手机号</label>
                <input type="tel" v-model="userInfo.phone" :disabled="!isEditing" class="form-input">
              </div>
            </div>
            <div class="form-row full-width">
              <div class="form-item">
                <label class="form-label">个人简介</label>
                <textarea v-model="userInfo.bio" rows="4" :disabled="!isEditing" class="form-input form-textarea" placeholder="简单介绍一下自己，让更多人认识你..."></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn save-btn">
                <span class="btn-icon">{{ isEditing ? '✓' : '✎' }}</span>
                <span>{{ isEditing ? '保存修改' : '修改信息' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
    <div class="modal-overlay" v-if="showAvatarModal" @click="showAvatarModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>更换头像</h3>
          <button class="modal-close" @click="showAvatarModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="avatar-preview">
            <img :src="newAvatar || userInfo.avatar || defaultAvatar" alt="预览头像">
          </div>
          <div class="avatar-tips">
            <p>建议上传正方形图片，大小不超过2MB</p>
          </div>
          <label class="file-upload-btn">
            <input type="file" accept="image/*" @change="changeAvatar">
            <span class="upload-icon">📁</span>
            <span>选择图片</span>
          </label>
        </div>
        <div class="modal-footer">
          <button class="btn cancel-btn" @click="showAvatarModal = false">取消</button>
          <button class="btn confirm-btn" @click="confirmAvatar">确认更换</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue'
import axios from 'axios'

// 1. 注入App.vue提供的全局状态
const globalState = inject('globalState') as {
  isLogin: boolean
  userInfo: {
    user_id: string
    nickname: string
    avatar: string
    email: string
  }
}

// 默认头像
const defaultAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJ5gMm5/gAAAABJRU5ErkJggg=='

// 用户信息
const userInfo = reactive({
  id: '',
  username: '',
  nickname: '',
  email: '',
  phone: '',
  bio: '',
  role: '',
  avatar: ''
})

// 编辑状态控制
const isEditing = ref(false)
const showAvatarModal = ref(false)
const newAvatar = ref('')

// 粒子背景相关
let particleCanvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let particles: Array<{ x: number, y: number, size: number, speedX: number, speedY: number, opacity: number }> = []
let animationId: number = 0

// 初始化粒子背景
const initParticles = () => {
  if (!particleCanvas) return
  particleCanvas.width = window.innerWidth
  particleCanvas.height = window.innerHeight
  ctx = particleCanvas.getContext('2d')
  particles = []
  const particleCount = Math.floor(window.innerWidth / 10)
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * particleCanvas.width,
      y: Math.random() * particleCanvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1
    })
  }
  const animate = () => {
    if (!ctx || !particleCanvas) return
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height)
    particles.forEach(particle => {
      particle.x += particle.speedX
      particle.y += particle.speedY
      if (particle.x < 0 || particle.x > particleCanvas.width) particle.speedX *= -1
      if (particle.y < 0 || particle.y > particleCanvas.height) particle.speedY *= -1
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      particles.forEach(other => {
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 100) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * particle.opacity})`
          ctx.lineWidth = 0.2
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(other.x, other.y)
          ctx.stroke()
        }
      })
    })
    animationId = requestAnimationFrame(animate)
  }
  animate()
}

// 窗口大小调整时重置粒子
const handleResize = () => {
  if (particleCanvas) {
    particleCanvas.width = window.innerWidth
    particleCanvas.height = window.innerHeight
  }
}

// 辅助函数：获取当前用户的存储方式（localStorage/sessionStorage）
const getUserStorage = () => {
  // 优先判断localStorage是否有token，否则用sessionStorage（与登录逻辑保持一致）
  return localStorage.getItem('token') ? localStorage : sessionStorage
}

// 辅助函数：同步全局状态到本地存储（核心：持久化）
const syncGlobalStateToStorage = () => {
  if (!globalState) return
  const storage = getUserStorage()
  // 序列化全局状态的userInfo，保存到本地
  storage.setItem('userInfo', JSON.stringify(globalState.userInfo))
}

// 从后端拉取用户信息（同步到全局状态+本地存储）
const fetchUserProfile = async () => {
  try {
    const userId = globalState?.userInfo?.user_id || 1
    const res = await axios.get('http://localhost:3000/api/user/profile', {
      params: { userId }
    })
    if (res.data.code === 200) {
      // 1. 同步后端数据到组件内用户信息
      Object.assign(userInfo, res.data.data)
      // 2. 同步到全局状态
      if (globalState) {
        globalState.userInfo.avatar = userInfo.avatar || ''
        globalState.userInfo.nickname = userInfo.nickname || ''
        globalState.userInfo.email = userInfo.email || ''
      }
      // 3. 同步到本地存储（保证初始状态持久化）
      syncGlobalStateToStorage()
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    alert('加载用户信息失败，请刷新页面重试')
  }
}

// 选择头像文件
const changeAvatar = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB，请选择更小的图片')
      return
    }
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (res) => {
      img.src = res.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const maxWidth = 500
        const ratio = maxWidth / img.width
        canvas.width = maxWidth
        canvas.height = img.height * ratio
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        newAvatar.value = canvas.toDataURL('image/png', 0.8)
      }
    }
    reader.readAsDataURL(file)
  }
}

// 确认更换头像（同步到后端+全局状态+本地存储）
const confirmAvatar = async () => {
  if (!newAvatar.value) return
  try {
    const userId = userInfo.id || globalState?.userInfo?.user_id || 1
    await axios.post('http://localhost:3000/api/user/profile', {
      userId,
      avatar: newAvatar.value
    })
    // 1. 组件内更新头像
    userInfo.avatar = newAvatar.value
    // 2. 同步更新全局状态
    if (globalState) {
      globalState.userInfo.avatar = newAvatar.value
    }
    // 3. 同步到本地存储（核心：解决路由跳转后丢失）
    syncGlobalStateToStorage()
    // 4. 关闭弹窗并重置
    showAvatarModal.value = false
    newAvatar.value = ''
    alert('头像更换成功！')
  } catch (err) {
    console.error('更新头像失败:', err)
    alert('头像更新失败，请重试')
  }
}

// 处理保存/编辑切换（同步到后端+全局状态+本地存储）
const handleSave = async () => {
  if (isEditing.value) {
    try {
      const userId = userInfo.id || globalState?.userInfo?.user_id || 1
      await axios.post('http://localhost:3000/api/user/profile', {
        userId,
        nickname: userInfo.nickname,
        email: userInfo.email,
        phone: userInfo.phone,
        bio: userInfo.bio
      })
      // 1. 关闭编辑模式
      isEditing.value = false
      // 2. 同步昵称等信息到全局状态
      if (globalState) {
        globalState.userInfo.nickname = userInfo.nickname
        globalState.userInfo.email = userInfo.email
      }
      // 3. 同步到本地存储
      syncGlobalStateToStorage()
      alert('信息保存成功！')
    } catch (err) {
      console.error('保存信息失败:', err)
      alert('保存失败，请检查信息格式（如邮箱）或重试')
    }
  } else {
    isEditing.value = true
  }
}

// 退出登录
const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    if (globalState) {
      globalState.isLogin = false
      globalState.userInfo = {
        user_id: '',
        nickname: '',
        avatar: '',
        email: ''
      }
    }
    // 清空本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userInfo')
    window.location.href = '/login'
  }
}

// 生命周期
onMounted(() => {
  particleCanvas = document.getElementById('particle-canvas') as HTMLCanvasElement
  initParticles()
  window.addEventListener('resize', handleResize)
  fetchUserProfile()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 样式部分保持不变，无需修改 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif;
}

.user-container {
  display: flex;
  min-height: 100vh;
  background: #000;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.particle-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.6;
}

.sidebar {
  width: 260px;
  background: rgba(18, 18, 18, 0.85);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: 2px 0 30px rgba(0, 0, 0, 0.5);
}

.user-info {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.avatar-box {
  margin-bottom: 1.5rem;
}

.avatar-frame {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-frame:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay span {
  font-size: 0.8rem;
  color: #fff;
  background: rgba(248, 113, 113, 0.8);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.user-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #fff;
}

.user-role {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.7rem;
  border-radius: 10px;
  display: inline-block;
}

.nav-menu {
  flex: 1;
}

.nav-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  cursor: pointer;
  margin-bottom: 0.8rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-btn.active {
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.2);
  cursor: default;
}

.nav-icon {
  margin-right: 0.8rem;
  font-size: 1rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.8rem;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.15);
  color: #f87171;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.logout-btn:hover {
  background: rgba(248, 113, 113, 0.15);
  border-color: rgba(248, 113, 113, 0.25);
}

.logout-icon {
  margin-right: 0.5rem;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  z-index: 1;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.8rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.profile-card {
  margin-bottom: 1.8rem;
}

.card-header {
  margin-bottom: 1.8rem;
}

.card-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
}

.card-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

.profile-form {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.form-row.full-width {
  flex-direction: column;
  gap: 0.8rem;
}

.form-item {
  flex: 1;
}

.form-label {
  display: block;
  margin-bottom: 0.6rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.9rem 1.1rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-input:disabled {
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.form-input:focus {
  outline: none;
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
  background: rgba(0, 0, 0, 0.6);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-btn {
  background: #f87171;
  color: #fff;
  box-shadow: 0 4px 15px rgba(248, 113, 113, 0.2);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(248, 113, 113, 0.3);
}

.btn-icon {
  font-size: 0.9rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

.modal-content {
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 1.8rem;
  transform: translateY(20px);
  animation: slideUp 0.3s forwards;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
}

.modal-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #f87171;
}

.modal-body {
  margin-bottom: 1.8rem;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1.2rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-tips {
  text-align: center;
  margin-bottom: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.file-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.9rem;
  background: #f87171;
  color: #fff;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(248, 113, 113, 0.2);
}

.file-upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(248, 113, 113, 0.3);
}

.file-upload-btn input {
  display: none;
}

.upload-icon {
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  max-width: 280px;
  margin: 0 auto;
  width: 100%;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  flex: 1;
  justify-content: center;
}

.confirm-btn {
  background: #f87171;
  color: #fff;
  flex: 1;
  justify-content: center;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

@keyframes slideUp {
  to { transform: translateY(0); }
}

@media (max-width: 768px) {
  .user-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .content {
    padding: 1.5rem;
  }
  
  .card {
    padding: 1.5rem;
  }
}
</style>