<template>
  <!-- 独立页面容器，避免样式冲突 -->
  <div class="color-library-page">
    <!-- 简约搜索栏 -->
    <div class="filter-container">
      <div class="filter-header">
        <h1 class="page-title">
          <span class="title-main">色彩灵感库</span>
          <span class="title-sub">专业配色方案精选</span>
        </h1>
        <div class="search-wrapper">
          <div class="search-box">
            <input 
              type="text" 
              class="search-input" 
              v-model="searchQuery" 
              @input="filterSchemes"
              placeholder="搜索配色方案..."
            />
            <span class="search-icon">🔍</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态提示区域 -->
    <div class="state-container" v-if="loading">
      <div class="loading-wrapper">
        <div class="loading-spinner"></div>
        <p class="loading-text">加载配色灵感中...</p>
      </div>
    </div>

    <div class="state-container" v-else-if="errorMsg">
      <div class="empty-error-card">
        <span class="state-icon">⚠️</span>
        <p class="state-text">{{ errorMsg }}</p>
        <button class="action-btn" @click="fetchColorSchemes">重新加载</button>
      </div>
    </div>

    <div class="state-container" v-else-if="filteredList.length === 0">
      <div class="empty-error-card">
        <span class="state-icon">🎨</span>
        <p class="state-text">暂无配色方案</p>
        <p class="state-subtext">尝试切换分类或创建新的配色方案</p>
      </div>
    </div>

    <!-- 配色卡片网格 -->
    <div class="scheme-grid" v-else>
      <div 
        class="scheme-card" 
        v-for="scheme in filteredList" 
        :key="scheme.id"
      >
        <!-- 卡片内容 -->
        <div class="card-content">
          <!-- 头部：标题和分类 -->
          <div class="card-header">
            <div class="title-wrapper">
              <h3 class="scheme-title">{{ scheme.title }}</h3>
              <span class="scheme-category" :class="getCategoryClass(scheme.category)">
                {{ scheme.category || '未分类' }}
              </span>
            </div>
            <button 
              class="collect-btn"
              :class="{ collected: scheme.isCollected }"
              @click="handleCollect(scheme.id)"
              :title="scheme.isCollected ? '取消收藏' : '收藏'"
            >
              {{ scheme.isCollected ? '❤️' : '♡' }}
            </button>
          </div>

          <!-- 配色描述 -->
          <p class="scheme-desc">{{ scheme.description || '专业的色彩搭配方案' }}</p>

          <!-- 颜色块区域 - 简约展示 -->
          <div class="color-palette">
            <div 
              class="color-swatch"
              v-for="(color, idx) in scheme.colors.slice(0, 6)"
              :key="idx"
              :style="{ backgroundColor: color }"
              @click="copyColorCode(color)"
              :aria-label="color"
            >
              <span class="color-value">{{ color }}</span>
            </div>
            <div class="color-extra" v-if="scheme.colors.length > 6">
              +{{ scheme.colors.length - 6 }}
            </div>
          </div>

          <!-- 卡片底部：提示文字 -->
          <div class="card-footer">
            <span class="tip-text">点击色块复制色值</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <transition name="fade">
      <div class="copy-toast" v-if="showCopyToast">
        <span class="toast-icon">✓</span>
        <span class="toast-text">已复制：{{ copiedColor }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// 注入App.vue的全局状态（修正注入格式，确保正确获取用户信息）
const globalState = inject('globalState') as any
const router = useRouter()

// 后端接口基础路径（与我的收藏界面保持一致）
const API_BASE = 'http://localhost:3000/api/color-library'

// 响应式数据
const colorList = ref<any[]>([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('') // 搜索关键词
const showCopyToast = ref(false)
const copiedColor = ref('')

// 筛选后的列表
const filteredList = computed(() => {
  if (!searchQuery.value) return colorList.value
  const query = searchQuery.value.toLowerCase()
  return colorList.value.filter(item => {
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.colors && item.colors.some((color: string) => color.toLowerCase().includes(query)))
    )
  })
})

// 获取分类样式类名（适配黑色模式，调整配色）
const getCategoryClass = (category: string) => {
  const classMap: Record<string, string> = {
    '主题色': 'category-primary',
    'UI色板': 'category-ui',
    '品牌色': 'category-brand',
    '深色模式': 'category-dark'
  }
  return classMap[category] || 'category-default'
}

// 加载配色方案（核心：同步用户已收藏状态）
const fetchColorSchemes = async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    // 1. 获取公开配色列表
    const res = await axios.get(`${API_BASE}/public`)
    
    if (res.data?.code === 200) {
      // 解析colors字段
      const processedData = res.data.data.map((item: any) => ({
        ...item,
        colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : item.colors,
        isCollected: false // 初始化为未收藏，后续覆盖
      }))
      colorList.value = processedData

      // 2. 若用户已登录，获取其收藏列表并同步状态
      if (globalState?.isLogin && globalState?.userInfo?.user_id) {
        await syncCollectedState()
      }
    } else {
      errorMsg.value = res.data?.message || '加载配色方案失败'
    }
  } catch (err: any) {
    console.error('请求失败:', err)
    if (err.message.includes('Network Error')) {
      errorMsg.value = '后端服务未启动，请先运行 node backend/app.js'
    } else {
      errorMsg.value = '网络异常，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

// 同步用户已收藏的配色状态（关键：保证与我的收藏界面数据一致）
const syncCollectedState = async () => {
  try {
    const res = await axios.get(`${API_BASE}/collections`, {
      params: { userId: globalState.userInfo.user_id } // 传递真实用户ID，替换临时0
    })

    if (res.data?.code === 200) {
      const collectedIds = res.data.data.map((item: any) => item.id)
      // 更新当前页面配色的收藏状态
      colorList.value.forEach(item => {
        item.isCollected = collectedIds.includes(item.id)
      })
    }
  } catch (err) {
    console.error('同步收藏状态失败:', err)
  }
}

// 复制颜色代码
const copyColorCode = async (color: string) => {
  try {
    await navigator.clipboard.writeText(color)
    copiedColor.value = color
    showCopyToast.value = true
    setTimeout(() => {
      showCopyToast.value = false
    }, 2500)
  } catch (err) {
    alert(`复制失败：${(err as Error).message}`)
  }
}

// 收藏/取消收藏（核心：调用后端接口，同步到我的收藏界面）
const handleCollect = async (schemeId: number) => {
  // 1. 未登录则跳转登录页
  if (!globalState?.isLogin) {
    router.push('/login')
    return
  }

  const targetScheme = colorList.value.find(item => item.id === schemeId)
  if (!targetScheme) return

  try {
    // 2. 调用后端切换收藏状态接口（传递正确参数）
    const res = await axios.post(`${API_BASE}/collect`, {
      schemeId,
      userId: globalState.userInfo.user_id, // 真实用户ID，确保后端记录正确
      isCollect: !targetScheme.isCollected // 切换收藏状态
    })

    if (res.data?.code === 200) {
      // 3. 更新当前页面的收藏状态
      targetScheme.isCollected = !targetScheme.isCollected
      alert(targetScheme.isCollected ? '收藏成功（可在「我的收藏」查看）' : '取消收藏成功')
    } else {
      alert(res.data?.message || '操作失败')
    }
  } catch (err) {
    console.error('收藏失败:', err)
    alert('收藏操作失败，请稍后重试')
  }
}

// 筛选分类（计算属性自动筛选，无需额外逻辑）
const filterSchemes = () => {}

// 初始化加载
onMounted(() => {
  fetchColorSchemes()
})
</script>

<style scoped>
/* 基础页面样式 - 黑色高级感核心：深色渐变+网格纹理+低饱和度配色 */
.color-library-page {
  min-height: 100vh;
  padding: 0;
  /* 黑色高级渐变背景 + 细微网格纹理，提升层次感（为毛玻璃卡片提供衬托） */
  background: linear-gradient(135deg, #0f172a 0%, #0a0f1f 100%);
  background-image: 
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}

/* 筛选容器 - 毛玻璃效果+深色风格 */
.filter-container {
  padding: 32px 24px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.5);
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.filter-header {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-main {
  font-size: 24px;
  font-weight: 600;
  color: #f8fafc;
}

.title-sub {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 400;
}

/* 搜索框 - 毛玻璃简约风格 */
.search-wrapper {
  position: relative;
  width: 300px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  background: rgba(26, 32, 44, 0.7);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 14px;
  transition: border-color 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:hover {
  border-color: #6366f1;
}

.search-input:focus {
  outline: none;
  border-color: #818cf8;
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.1);
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 16px;
  pointer-events: none;
}

.search-input:focus + .search-icon {
  color: #818cf8;
}

/* 状态容器 - 统一样式，毛玻璃效果 */
.state-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 24px;
}

.empty-error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 32px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  text-align: center;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.state-icon {
  font-size: 48px;
  color: #94a3b8;
}

.state-text {
  font-size: 16px;
  color: #f8fafc;
  margin: 0;
  font-weight: 500;
}

.state-subtext {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

/* 按钮 - 深色模式简约按钮，毛玻璃效果 */
.action-btn {
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.8);
  border: 1px solid rgba(129, 140, 248, 0.5);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.action-btn:hover {
  background: rgba(79, 70, 229, 0.9);
}

/* 加载动画 - 适配深色模式 */
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(71, 85, 105, 0.5);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

/* 配色卡片网格 - 规整间距，响应式适配 */
.scheme-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 32px; /* 加大间距，突出透明卡片的独立感 */
}

/* 配色卡片 - 核心升级：透明毛玻璃风格（精致感拉满）【核心修改区】 */
.scheme-card {
  /* 1. 高透明背景：极低不透明度，打造"悬浮透明"感，衬托底层网格背景 */
  background: rgba(26, 32, 44, 0.35);
  /* 2. 柔和半透边框：浅灰蓝+低不透明度，带轻微品牌色倾向，不突兀 */
  border: 1px solid rgba(129, 140, 248, 0.2);
  /* 3. 圆润边角：提升精致感，与毛玻璃风格更匹配 */
  border-radius: 12px;
  overflow: hidden;
  /* 4. 强毛玻璃模糊：提升背景虚化效果，突出透明质感 */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  /* 5. 细腻分层阴影：避免厚重，打造"悬浮空气感" */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12), /* 外层柔和阴影，提升悬浮感 */
    0 1px 2px rgba(0, 0, 0, 0.08); /* 内层细微阴影，提升层次感 */
  /* 6. 细腻过渡：所有状态变化更柔和 */
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 卡片hover效果：精致悬浮，不夸张【核心修改区】 */
.scheme-card:hover {
  /* 1. 轻微提高背景透明度，增强通透感 */
  background: rgba(26, 32, 44, 0.45);
  /* 2. 边框提亮，呼应品牌色，增强交互反馈 */
  border-color: rgba(129, 140, 248, 0.4);
  /* 3. 阴影优化：稍加深，提升悬浮感，不厚重 */
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.18),
    0 2px 4px rgba(0, 0, 0, 0.1);
  /* 4. 轻微上浮：比原来更细腻，避免突兀 */
  transform: translateY(-3px);
}

.card-content {
  padding: 24px;
}

/* 卡片头部 - 简约排版，适配透明毛玻璃风格 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.scheme-title {
  font-size: 18px;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
  /* 文字轻微阴影，提升在透明背景上的可读性 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 分类标签 - 透明毛玻璃风格，与卡片整体统一【核心修改区】 */
.scheme-category {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px; /* 圆润边角，提升精致感 */
  font-weight: 500;
  width: fit-content;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* 标签高透明，与卡片风格统一 */
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 分类标签样式 - 低饱和度，高透明，适配透明毛玻璃卡片 */
.category-primary {
  background: rgba(99, 102, 241, 0.15);
  color: #c7d2fe;
  border-color: rgba(99, 102, 241, 0.2);
}
.category-ui {
  background: rgba(5, 150, 105, 0.15);
  color: #a7f3d0;
  border-color: rgba(5, 150, 105, 0.2);
}
.category-brand {
  background: rgba(124, 58, 237, 0.15);
  color: #ddd6fe;
  border-color: rgba(124, 58, 237, 0.2);
}
.category-dark {
  background: rgba(75, 85, 99, 0.15);
  color: #e2e8f0;
  border-color: rgba(75, 85, 99, 0.2);
}
.category-default {
  background: rgba(107, 114, 128, 0.15);
  color: #d1d5db;
  border-color: rgba(107, 114, 128, 0.2);
}

/* 收藏按钮 - 透明毛玻璃风格，与卡片协调统一【核心修改区】 */
.collect-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  /* 高透明背景，与卡片形成轻微区分 */
  background: rgba(15, 23, 42, 0.6);
  /* 柔和边框，呼应卡片品牌色 */
  border: 1px solid rgba(129, 140, 248, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-size: 16px;
  /* 文字颜色：柔和浅灰，提升可读性 */
  color: #a5b4fc;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 未收藏状态hover：增强透明感，提亮边框 */
.collect-btn:hover:not(.collected) {
  background: rgba(26, 32, 44, 0.7);
  border-color: rgba(129, 140, 248, 0.5);
  color: #c7d2fe;
  transform: scale(1.05); /* 轻微缩放，增强交互反馈 */
}

/* 已收藏状态：透明红色系，与卡片风格统一 */
.collect-btn.collected {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* 已收藏状态hover：加深红色透明感，保持精致 */
.collect-btn.collected:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fecdd3;
  transform: scale(1.05);
}

/* 配色描述 - 适配透明毛玻璃背景，提升可读性 */
.scheme-desc {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  /* 轻微文字阴影，提升在透明背景上的可读性 */
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

/* 颜色展示区 - 极简设计，适配透明毛玻璃风格 */
.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.color-swatch {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1); /* 柔和边框，适配透明风格 */
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.color-swatch:hover {
  transform: scale(1.05);
  border-color: rgba(129, 140, 248, 0.4);
}

/* 色值文本 - 透明毛玻璃背景，提升精致感 */
.color-value {
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 10px;
  color: #fff;
  background: rgba(0, 0, 0, 0.4); /* 更高透明的背景，适配卡片风格 */
  padding: 2px 4px;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
  white-space: nowrap;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.color-swatch:hover .color-value {
  opacity: 1;
}

/* 更多颜色提示 - 透明毛玻璃风格，与卡片统一 */
.color-extra {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: rgba(26, 32, 44, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 卡片底部 - 透明毛玻璃风格，简约精致 */
.card-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08); /* 更浅的分隔线，适配透明风格 */
}

.tip-text {
  font-size: 12px;
  color: #64748b;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

/* 复制提示 - 透明毛玻璃风格，与卡片统一 */
.copy-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(129, 140, 248, 0.3);
  color: #f8fafc;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.toast-icon {
  font-weight: bold;
  color: #10b981;
}

/* 过渡动画 - 细腻不夸张 */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

/* 响应式适配 - 大厂规范，断点清晰 */
@media (max-width: 768px) {
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .search-wrapper {
    width: 100%;
  }
  
  .scheme-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    padding: 24px 16px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .copy-toast {
    top: 70px;
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .scheme-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-container {
    padding: 24px 16px;
  }
  
  .title-main {
    font-size: 20px;
  }
}
</style>