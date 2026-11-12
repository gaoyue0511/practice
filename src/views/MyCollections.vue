<template>
  <div class="color-library-page">
    <div class="filter-container">
      <div class="filter-header">
        <h1 class="page-title">
          <span class="title-main">我的收藏</span>
          <span class="title-sub">已收藏的专业配色方案</span>
        </h1>
        <div class="filter-wrapper">
          <button class="back-btn" @click="navigateTo('/color-library')">
            浏览色彩库
          </button>
        </div>
      </div>
    </div>

    <div class="state-container" v-if="loading">
      <div class="loading-wrapper">
        <div class="loading-spinner"></div>
        <p class="loading-text">加载我的收藏中...</p>
      </div>
    </div>

    <div class="state-container" v-else-if="errorMsg">
      <div class="empty-error-card">
        <span class="state-icon">⚠️</span>
        <p class="state-text">{{ errorMsg }}</p>
        <button class="action-btn" @click="fetchCollections">重新加载</button>
      </div>
    </div>

    <div class="state-container" v-else-if="schemes.length === 0">
      <div class="empty-error-card">
        <span class="state-icon">⭐</span>
        <p class="state-text">暂无收藏的色彩方案</p>
        <p class="state-subtext">前往色彩库收藏你喜欢的配色方案吧</p>
        <button class="action-btn" @click="navigateTo('/color-library')">去色彩库</button>
      </div>
    </div>

    <div class="scheme-grid" v-else>
      <div
        class="scheme-card"
        v-for="scheme in schemes"
        :key="scheme.id + '-' + scheme.sourceType"
      >
        <div class="card-content">
          <div class="card-header">
            <div class="title-wrapper">
              <h3 class="scheme-title">{{ scheme.title }}</h3>
              <span class="scheme-category" :class="getCategoryClass(scheme.category)">
                {{ scheme.sourceType === 'ai' ? '智能配色' : (scheme.category || '未分类') }}
              </span>
            </div>
            <button
              class="collect-btn"
              :class="{ collected: scheme.isCollected }"
              @click="removeCollection(scheme.id, scheme.sourceType)"
              title="取消收藏"
            >
              ❤️
            </button>
          </div>

          <p class="scheme-desc">{{ scheme.description || '专业的色彩搭配方案' }}</p>

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

          <div class="card-footer">
            <span class="tip-text">点击色块复制色值 | 收藏时间：{{ formatTime(scheme.collectedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div class="copy-toast" v-if="showCopyToast">
        <span class="toast-icon">✓</span>
        <span class="toast-text">已复制：{{ copiedColor }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const globalState = inject('globalState') as Record<string, any>;
const router = useRouter();

const API_BASE = 'http://localhost:3000/api/color-library';

const schemes = ref<any[]>([]);
const loading = ref<boolean>(true);
const errorMsg = ref<string>('');
const showCopyToast = ref<boolean>(false);
const copiedColor = ref<string>('');

const getCategoryClass = (category: string): string => {
  const classMap: Record<string, string> = {
    '主题色': 'category-primary',
    'UI色板': 'category-ui',
    '品牌色': 'category-brand',
    '深色模式': 'category-dark',
    '智能配色': 'category-ai'
  };
  return classMap[category] || 'category-default';
};

const navigateTo = (path: string): void => {
  router.push(path);
};

const fetchCollections = async (): Promise<void> => {
  loading.value = true;
  errorMsg.value = '';

  if (!globalState?.isLogin || !globalState?.userInfo?.user_id) {
    errorMsg.value = '请先登录后查看我的收藏';
    loading.value = false;
    return;
  }

  try {
    const libraryRes = axios.get(`${API_BASE}/collections`, {
      params: { userId: globalState.userInfo.user_id }
    });

    const aiRes = axios.get(`${API_BASE}/ai/collections`, {
      params: { userId: globalState.userInfo.user_id }
    });

    const [libraryData, aiData] = await Promise.all([libraryRes, aiRes]);

    const allSchemes: any[] = [];

    if (libraryData.data?.code === 200) {
      libraryData.data.data.forEach((scheme: any) => {
        allSchemes.push({
          ...scheme,
          colors: parseColors(scheme.colors),
          isCollected: true,
          collectedAt: scheme.created_at || new Date().toISOString(),
          sourceType: 'library'
        });
      });
    }

    if (aiData.data?.code === 200) {
      aiData.data.data.forEach((scheme: any) => {
        allSchemes.push({
          ...scheme,
          colors: parseColors(scheme.colors),
          isCollected: true,
          collectedAt: scheme.collectedAt || new Date().toISOString(),
          sourceType: 'ai'
        });
      });
    }

    schemes.value = allSchemes;
  } catch (err: any) {
    if (err.message.includes('Network Error')) {
      errorMsg.value = '后端服务未启动，请先运行：node backend/app.js';
    } else {
      errorMsg.value = '获取收藏失败：' + err.message;
    }
  } finally {
    loading.value = false;
  }
};

const removeCollection = async (schemeId: number, sourceType: string): Promise<void> => {
  if (!globalState?.isLogin || !globalState?.userInfo?.user_id) {
    alert('请先登录后操作');
    navigateTo('/login');
    return;
  }

  try {
    const endpoint = sourceType === 'ai' ? '/ai/collect' : '/collect';
    const res = await axios.post(`${API_BASE}${endpoint}`, {
      schemeId,
      userId: globalState.userInfo.user_id,
      isCollect: false
    });

    if (res.data?.code === 200) {
      schemes.value = schemes.value.filter(item => !(item.id === schemeId && item.sourceType === sourceType));
      alert('取消收藏成功');
    } else {
      alert(res.data?.message || '取消收藏失败');
    }
  } catch (err: any) {
    alert('取消收藏请求失败：' + err.message);
  }
};

const copyColorCode = async (color: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(color);
    copiedColor.value = color;
    showCopyToast.value = true;
    setTimeout(() => {
      showCopyToast.value = false;
    }, 2500);
  } catch (err: any) {
    alert('复制失败：' + err.message);
  }
};

const parseColors = (colorData: any): string[] => {
  if (!colorData) return [];
  if (typeof colorData === 'string') {
    try {
      return JSON.parse(colorData);
    } catch (err) {
      console.error('解析色彩数据失败:', err);
      return colorData.match(/#[0-9A-Fa-f]{3,6}/g) || [];
    }
  }
  return Array.isArray(colorData) ? colorData : [];
};

const formatTime = (timeStr: string): string => {
  if (!timeStr) return '未知';
  return new Date(timeStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchCollections();
});
</script>

<style scoped>
.color-library-page {
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

.back-btn {
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

.back-btn:hover {
  background: rgba(79, 70, 229, 0.9);
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
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  text-align: center;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
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
  gap: 24px;
}

.scheme-card {
  background: rgba(26, 32, 44, 0.7);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.scheme-card:hover {
  border-color: rgba(129, 140, 248, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
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
}

.scheme-category {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  width: fit-content;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.category-primary {
  background: rgba(99, 102, 241, 0.2);
  color: #c7d2fe;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.category-ui {
  background: rgba(5, 150, 105, 0.2);
  color: #a7f3d0;
  border: 1px solid rgba(5, 150, 105, 0.3);
}
.category-brand {
  background: rgba(124, 58, 237, 0.2);
  color: #ddd6fe;
  border: 1px solid rgba(124, 58, 237, 0.3);
}
.category-dark {
  background: rgba(75, 85, 99, 0.2);
  color: #e2e8f0;
  border: 1px solid rgba(75, 85, 99, 0.3);
}
.category-ai {
  background: rgba(249, 115, 22, 0.2);
  color: #fed7aa;
  border: 1px solid rgba(249, 115, 22, 0.3);
}
.category-default {
  background: rgba(107, 114, 128, 0.2);
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.collect-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-size: 16px;
  color: #fca5a5;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.collect-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.scheme-desc {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  border: 1px solid rgba(71, 85, 105, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.color-swatch:hover {
  transform: scale(1.05);
  border-color: rgba(129, 140, 248, 0.5);
}

.color-value {
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 10px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 4px;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
  white-space: nowrap;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.color-swatch:hover .color-value {
  opacity: 1;
}

.color-extra {
  width: 48px;
  height: 48px;
  background: rgba(26, 32, 44, 0.7);
  border: 1px solid rgba(71, 85, 105, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.tip-text {
  font-size: 12px;
  color: #64748b;
}

.copy-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #f8fafc;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
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
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .scheme-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
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
