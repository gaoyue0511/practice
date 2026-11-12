<template>
  <div class="home-container">
    <!-- 背景纹理层（增加细微质感，避免纯黑单调） -->
    <div class="bg-texture"></div>
    
    <!-- 主视觉内容 -->
    <div class="home-content">
      <!-- 标题区域（带渐入动画） -->
      <h1 class="main-title" :class="{ 'animate-in': isVisible }">
        Smart Color Matching Workshop
      </h1>
      <p class="sub-title" :class="{ 'animate-in': isVisible }">
        专业的配色工具，助力你的设计创作
      </p>
    </div>

    <!-- 功能卡片区域 -->
    <div class="features-section" :class="{ 'animate-in': isFeaturesVisible }">
      <div class="feature-card" @click="router.push('/color-library')">
        <div class="feature-icon">🎨</div>
        <h3 class="feature-title">色彩库</h3>
        <p class="feature-desc">探索精选配色方案，灵感随时获取</p>
        <div class="feature-arrow">→</div>
      </div>
      
      <!-- 智能配色：直接绑定router.push，确保跳转 -->
      <div class="feature-card" @click="router.push('/color-generate')">
        <div class="feature-icon">🧠</div>
        <h3 class="feature-title">智能配色</h3>
        <p class="feature-desc">AI驱动的配色生成，精准匹配设计需求</p>
        <div class="feature-arrow">→</div>
      </div>
    </div>

    <!-- 装饰性彩色粒子（呼应蝴蝶色彩，增加动态层次） -->
    <div class="particles">
      <div class="particle" v-for="i in 12" :key="i" :style="particleStyles(i)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 路由实例（确保正确创建）
const router = useRouter()
console.log('路由实例初始化：', router); // 验证实例是否正常

// 滚动/加载动画控制
const isVisible = ref(false)
const isFeaturesVisible = ref(false)

onMounted(() => {
  // 页面加载后触发标题动画
  setTimeout(() => isVisible.value = true, 300)
  // 延迟显示功能卡片，增加层次感
  setTimeout(() => isFeaturesVisible.value = true, 800)
  
  // 监听滚动，增强交互感
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
})

// 滚动时微调标题透明度（增强深度感）
const handleScroll = () => {
  const scrollY = window.scrollY
  const opacity = Math.max(1 - scrollY / 500, 0.6)
  document.querySelector('.main-title')?.setAttribute('style', `opacity: ${opacity}`)
}

// 随机粒子样式（增加光晕参数，保持原有逻辑）
const particleStyles = (i: number) => {
  const colors = ['#f87171', '#fb923c', '#38bdf8', '#a78bfa', '#4ade80']
  const size = Math.random() * 8 + 2 
  const haloSize = Math.random() * 20 + 15 
  const posX = Math.random() * 100 
  const posY = Math.random() * 100 
  const delay = Math.random() * 5 
  const duration = Math.random() * 10 + 10 
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: colors[i % colors.length],
    '--color': colors[i % colors.length],
    '--halo-size': `${haloSize}px`,
    left: `${posX}%`,
    top: `${posY}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}
</script>

<style scoped>
/* 主容器：黑色背景+蝴蝶主视觉 */
.home-container {
  position: relative;
  width: 100% !important;
  min-height: 100vh !important;
  padding-top: 60px !important;
  padding-bottom: 80px !important;
  box-sizing: border-box !important;
  background-color: #000;
  /* 修复：绝对路径改为相对路径 */
  background-image: url("../assets/images/indexbackground.png");
  background-size: 55% auto;
  background-repeat: no-repeat !important;
  background-position: center 20%;
}

/* 背景纹理：极淡网格，增加高级质感（不影响主视觉） */
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
}

/* 主内容区：居中+层次 */
.home-content {
  position: relative;
  z-index: 2;
  color: #fff;
  text-align: center;
  padding: 0rem 2rem 10rem;
  max-width: 900px;
  margin: 0 auto;
}

/* 主标题：强化视觉焦点 */
.main-title {
  font-size: clamp(3rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 1.2rem;
  background: linear-gradient(130deg, #fff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 15px rgba(0,0,0,0.3);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 副标题：弱化但清晰 */
.sub-title {
  font-size: clamp(1.25rem, 2.5vw, 1.6rem);
  font-weight: 300;
  line-height: 1.6;
  letter-spacing: 0.02em;
  color: rgba(255,255,255,0.85);
  max-width: 650px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
}

/* 功能卡片区域布局 - 大幅下移 */
.features-section {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 10rem auto 4rem;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s;
}

/* 功能卡片样式（修复：提升层级，确保点击优先） */
.feature-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
  z-index: 10; /* 新增：确保卡片层级最高，点击不被遮挡 */
  pointer-events: auto !important; /* 强制启用点击事件 */
}

/* 卡片渐变光效 */
.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  transition: all 0.6s ease;
}

/* 卡片hover效果 */
.feature-card:hover::before {
  left: 100%;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255,255,255,0.12);
}

/* 功能卡片图标 */
.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

/* 功能卡片标题 */
.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
  line-height: 1.3;
}

/* 功能卡片描述 */
.feature-desc {
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1rem;
}

/* 功能卡片箭头 */
.feature-arrow {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  color: rgba(255,255,255,0.5);
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

/* 差异化配色（呼应粒子色彩） */
.feature-card:nth-child(1) .feature-icon {
  color: #f87171;
}
.feature-card:nth-child(1):hover {
  box-shadow: 0 15px 30px rgba(0,0,0,0.2), 0 0 20px rgba(248,113,113,0.1);
}
.feature-card:nth-child(1):hover .feature-arrow {
  color: #f87171;
}

.feature-card:nth-child(2) .feature-icon {
  color: #38bdf8;
}
.feature-card:nth-child(2):hover {
  box-shadow: 0 15px 30px rgba(0,0,0,0.2), 0 0 20px rgba(56,189,248,0.1);
}
.feature-card:nth-child(2):hover .feature-arrow {
  color: #38bdf8;
}

.feature-card:nth-child(3) .feature-icon {
  color: #a78bfa;
}
.feature-card:nth-child(3):hover {
  box-shadow: 0 15px 30px rgba(0,0,0,0.2), 0 0 20px rgba(167,139,250,0.1);
}
.feature-card:nth-child(3):hover .feature-arrow {
  color: #a78bfa;
}

/* 动画：元素进入视口时的渐入效果 */
.animate-in {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

/* 彩色粒子：升级高级光效 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none; 
  z-index: 1;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color) 30%, rgba(255,255,255,0) 80%);
  box-shadow: 
    0 0 calc(var(--halo-size) * 0.4) var(--color),
    0 0 var(--halo-size) rgba(255,255,255,0.2),
    0 0 calc(var(--halo-size) * 1.5) rgba(255,255,255,0.05);
  filter: blur(0.6px);
  opacity: 0.7;
  animation: float-enhanced 15s infinite ease-in-out;
}

/* 优化粒子动画：更自然的脉冲+位移 */
@keyframes float-enhanced {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(0.9);
    opacity: 0.5;
    box-shadow: 
      0 0 calc(var(--halo-size) * 0.3) var(--color),
      0 0 calc(var(--halo-size) * 0.8) rgba(255,255,255,0.15);
  }
  25% {
    transform: translateY(-20px) translateX(10px) scale(1.1);
    opacity: 0.8;
    box-shadow: 
      0 0 calc(var(--halo-size) * 0.5) var(--color),
      0 0 var(--halo-size) rgba(255,255,255,0.25);
  }
  50% {
    transform: translateY(-5px) translateX(-15px) scale(1);
    opacity: 0.6;
    box-shadow: 
      0 0 calc(var(--halo-size) * 0.4) var(--color),
      0 0 calc(var(--halo-size) * 0.9) rgba(255,255,255,0.2);
  }
  75% {
    transform: translateY(-15px) translateX(5px) scale(1.2);
    opacity: 0.9;
    box-shadow: 
      0 0 calc(var(--halo-size) * 0.6) var(--color),
      0 0 calc(var(--halo-size) * 1.2) rgba(255,255,255,0.3);
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .features-section {
    margin: 6rem auto 3rem;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .home-content {
    padding: 4rem 2rem 6rem;
  }
  
  .feature-card {
    padding: 2rem 1.5rem;
  }
}

/* 大屏适配 */
@media (min-width: 1440px) {
  .features-section {
    margin: 12rem auto 4rem;
  }
  
  .home-container {
    background-position: center 15%;
  }
}
</style>