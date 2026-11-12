<template>
  <div class="color-generate-page">
    <div class="filter-container">
      <div class="filter-header">
        <h1 class="page-title">
          <span class="title-main">智能配色生成</span>
          <span class="title-sub">输入关键词，一键生成专业配色方案</span>
        </h1>
      </div>
    </div>

    <div class="input-container">
      <input
        v-model="keyword"
        placeholder="输入设计风格（如：商务科技、清新马卡龙、复古国风）"
        class="keyword-input"
        @keyup.enter="generateSchemes"
      />
      <button class="generate-btn" @click="generateSchemes" :disabled="loading">
        {{ loading ? '生成中...' : '生成' }}
      </button>
    </div>

    <div class="color-count">
      <label class="count-label">配色数量：</label>
      <div class="filter-selector">
        <select v-model="colorCount" class="category-select">
          <option value="4">4色</option>
          <option value="5">5色</option>
          <option value="6">6色</option>
        </select>
      </div>
    </div>

    <div class="state-container" v-if="loading">
      <div class="loading-wrapper">
        <div class="loading-spinner"></div>
        <p class="loading-text">AI 正在生成配色方案...</p>
      </div>
    </div>

    <div class="state-container" v-else-if="errorMsg">
      <div class="empty-error-card">
        <span class="state-icon">⚠️</span>
        <p class="state-text">{{ errorMsg }}</p>
        <button class="action-btn" @click="generateSchemes">重新生成</button>
      </div>
    </div>

    <div class="state-container" v-else-if="schemes.length === 0">
      <div class="empty-error-card">
        <span class="state-icon">🎨</span>
        <p class="state-text">输入风格关键词生成配色</p>
        <p class="state-subtext">例如：商务科技、清新马卡龙、复古国风</p>
      </div>
    </div>

    <div class="scheme-grid" v-else>
      <div
        class="scheme-card"
        v-for="(scheme, index) in schemes"
        :key="index"
      >
        <div class="card-content">
          <div class="card-header">
            <div class="title-wrapper">
              <h3 class="scheme-title">方案 {{ index + 1 }}</h3>
              <span class="scheme-category category-primary">
                {{ keyword || '自定义风格' }}
              </span>
            </div>
            <button
              class="collect-btn"
              :class="{ collected: scheme.isCollected }"
              @click="handleCollect(index)"
              :title="scheme.isCollected ? '取消收藏' : '收藏'"
            >
              {{ scheme.isCollected ? '❤️' : '♡' }}
            </button>
          </div>

          <p class="scheme-desc">基于"{{ keyword }}"风格生成的专业配色方案</p>

          <div class="color-palette">
            <div
              class="color-swatch"
              v-for="(color, idx) in scheme.colors"
              :key="idx"
              :style="{ backgroundColor: color.hex }"
              @click="copyColorCode(color.hex)"
              :aria-label="color.hex"
            >
              <span class="color-value">{{ color.hex }}</span>
            </div>
          </div>

          <div class="card-footer">
            <span class="tip-text">点击色块复制色值</span>
          </div>
        </div>
      </div>
    </div>

    <button
      class="clear-btn"
      @click="clearAll"
      v-if="schemes.length > 0"
    >
      清空所有方案
    </button>

    <transition name="fade">
      <div class="copy-toast" v-if="showCopyToast">
        <span class="toast-icon">✓</span>
        <span class="toast-text">已复制：{{ copiedColor }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import axios from 'axios'

const globalState = inject('globalState') as any

const API_BASE = 'http://localhost:3000/api'

const keyword = ref('')
const colorCount = ref('4')
const schemes = ref<any[]>([])
const showCopyToast = ref(false)
const copiedColor = ref('')
const loading = ref(false)
const errorMsg = ref('')

const generateSchemes = async () => {
  if (!keyword.value.trim()) {
    errorMsg.value = '请输入设计风格关键词'
    return
  }

  loading.value = true
  errorMsg.value = ''
  try {
    const response = await axios.post(`${API_BASE}/color-generator/generate`, {
      style: keyword.value,
      colorCount: parseInt(colorCount.value)
    })

    if (response.data.code === 200) {
      schemes.value = response.data.data
    } else {
      errorMsg.value = '生成配色失败：' + response.data.message
    }
  } catch (error) {
    console.error('生成配色失败:', error)
    errorMsg.value = '生成配色失败，请检查后端服务是否运行'
  } finally {
    loading.value = false
  }
}

const clearAll = () => {
  keyword.value = ''
  schemes.value = []
  colorCount.value = '4'
  errorMsg.value = ''
}

const copyColorCode = async (color: string) => {
  try {
    await navigator.clipboard.writeText(color)
    copiedColor.value = color
    showCopyToast.value = true
    setTimeout(() => {
      showCopyToast.value = false
    }, 2500)
  } catch (err) {
    alert('复制失败：' + (err as Error).message)
  }
}

const handleCollect = async (index: number) => {
  const scheme = schemes.value[index]

  if (!globalState?.isLogin || !globalState?.userInfo?.user_id) {
    alert('请先登录后再收藏')
    return
  }

  try {
    if (!scheme.isCollected) {
      const colors = scheme.colors.map((c: any) => c.hex)

      const saveResponse = await axios.post(`${API_BASE}/color-generator/save`, {
        userId: globalState.userInfo.user_id,
        colors: colors,
        styleName: keyword.value || '智能配色'
      })

      if (saveResponse.data.code === 200) {
        scheme.savedId = saveResponse.data.data.id

        const collectResponse = await axios.post(`${API_BASE}/color-library/ai/collect`, {
          schemeId: saveResponse.data.data.id,
          userId: globalState.userInfo.user_id,
          isCollect: true
        })

        if (collectResponse.data.code === 200) {
          scheme.isCollected = true
          alert('收藏成功')
        } else {
          alert(collectResponse.data.message || '收藏失败')
        }
      } else {
        alert(saveResponse.data.message || '保存失败')
      }
    } else {
      if (scheme.savedId) {
        const collectResponse = await axios.post(`${API_BASE}/color-library/ai/collect`, {
          schemeId: scheme.savedId,
          userId: globalState.userInfo.user_id,
          isCollect: false
        })

        if (collectResponse.data.code === 200) {
          scheme.isCollected = false
          alert('取消收藏成功')
        } else {
          alert(collectResponse.data.message || '取消收藏失败')
        }
      }
    }
  } catch (err) {
    console.error('收藏操作失败:', err)
    alert('操作失败：' + (err as Error).message)
  }
}
</script>

<style scoped>
.color-generate-page {
  min-height: 100vh;
  padding: 0;
  background: linear-gradient(135deg, #0f172a 0%, #0a0f1f 100%);
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}

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
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.page-title {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
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

.input-container {
  display: flex;
  gap: 1rem;
  margin: 2rem auto;
  max-width: 800px;
  padding: 0 24px;
}

.keyword-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(26, 32, 44, 0.7);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 14px;
  transition: border-color 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.keyword-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.1);
}

.keyword-input::placeholder {
  color: #94a3b8;
}

.generate-btn {
  padding: 0 24px;
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

.generate-btn:hover:not(:disabled) {
  background: rgba(79, 70, 229, 0.9);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.color-count {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 auto 2rem;
  max-width: 800px;
  padding: 0 24px;
  color: #94a3b8;
}

.count-label {
  font-size: 14px;
}

.filter-selector {
  position: relative;
  width: 120px;
}

.category-select {
  appearance: none;
  width: 100%;
  padding: 8px 16px;
  background: rgba(26, 32, 44, 0.7);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.category-select:hover {
  border-color: #6366f1;
}

.category-select:focus {
  outline: none;
  border-color: #818cf8;
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.1);
}

.filter-selector::after {
  content: '';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #94a3b8;
  pointer-events: none;
}

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

.scheme-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 32px;
}

.scheme-card {
  background: rgba(26, 32, 44, 0.35);
  border: 1px solid rgba(129, 140, 248, 0.2);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.scheme-card:hover {
  background: rgba(26, 32, 44, 0.45);
  border-color: rgba(129, 140, 248, 0.4);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.18),
    0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.card-content {
  padding: 24px;
}

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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.scheme-category {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  width: fit-content;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.category-primary {
  background: rgba(99, 102, 241, 0.15);
  color: #c7d2fe;
  border-color: rgba(99, 102, 241, 0.2);
}

.collect-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(129, 140, 248, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-size: 16px;
  color: #a5b4fc;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.collect-btn:hover:not(.collected) {
  background: rgba(26, 32, 44, 0.7);
  border-color: rgba(129, 140, 248, 0.5);
  color: #c7d2fe;
  transform: scale(1.05);
}

.collect-btn.collected {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.collect-btn.collected:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fecdd3;
  transform: scale(1.05);
}

.scheme-desc {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

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
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.color-swatch:hover {
  transform: scale(1.05);
  border-color: rgba(129, 140, 248, 0.4);
}

.color-value {
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 10px;
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
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

.card-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.tip-text {
  font-size: 12px;
  color: #64748b;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

.clear-btn {
  display: block;
  width: 200px;
  margin: 0 auto 32px;
  padding: 12px;
  background: rgba(26, 32, 44, 0.7);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.clear-btn:hover {
  background: rgba(26, 32, 44, 0.9);
  color: #f8fafc;
  border-color: rgba(129, 140, 248, 0.3);
}

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

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

@media (max-width: 768px) {
  .input-container {
    flex-direction: column;
    max-width: 500px;
    padding: 0 16px;
  }

  .generate-btn {
    padding: 12px;
  }

  .color-count {
    max-width: 500px;
    padding: 0 16px;
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
