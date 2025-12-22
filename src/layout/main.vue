<template>
  <div class="app-content__wrapper">
    <!-- 页面内容容器 -->
    <div class="content-container">
      <!-- 路由视图 - 动态显示不同页面内容 -->
      <router-view v-slot="{ Component, route }">
        <!-- 页面切换过渡动画 -->
        <transition 
          name="page-fade" 
          mode="out-in"
          appear
        >
          <component 
            :is="Component" 
            :key="route.path"
            class="page-component"
          />
        </transition>
      </router-view>
    </div>
    
    <!-- 全局加载状态 -->
    <div v-if="isLoading" class="global-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 响应式数据
const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const pageKey = ref('')

// 计算属性
const currentPageTitle = computed(() => {
  const titleMap = {
    '/': '首页',
    '/mine': '个人中心',
    '/discover': '发现音乐',
    '/playlist': '播放列表',
    '/rank': '排行榜'
  }
  return titleMap[route.path] || '网易云音乐'
})

// 监听路由变化
watch(() => route.path, (newPath) => {
  // 页面切换时可以添加加载状态
  if (newPath !== pageKey.value) {
    pageKey.value = newPath
    // 可以在这里添加页面切换逻辑
  }
}, { immediate: true })

// 页面加载完成
const handlePageLoaded = () => {
  isLoading.value = false
}

// 页面加载开始
const handlePageLoading = () => {
  isLoading.value = true
}

// 生命周期钩子
onMounted(() => {
  // 监听页面加载事件
  window.addEventListener('page-loading', handlePageLoading)
  window.addEventListener('page-loaded', handlePageLoaded)
  
  // 设置页面标题
  document.title = currentPageTitle.value
})

onUnmounted(() => {
  window.removeEventListener('page-loading', handlePageLoading)
  window.removeEventListener('page-loaded', handlePageLoaded)
})

// 监听路由变化更新页面标题
watch(currentPageTitle, (newTitle) => {
  document.title = newTitle
})
</script>

<style scoped>
/* 页面组件容器 */
.page-component {
  min-height: 600px;
  background-color: var(--color-bg-primary);
}

/* 页面切换过渡动画 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all var(--transition-normal) var(--ease-in-out);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.page-fade-enter-to,
.page-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* 全局加载状态 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-component {
    min-height: 500px;
  }
}

@media (max-width: 576px) {
  .page-component {
    min-height: 400px;
  }
}

/* 内容容器样式增强 */
.content-container {
  position: relative;
  overflow: hidden;
}

/* 页面滚动优化 */
.app-content__wrapper {
  scroll-behavior: smooth;
}

/* 自定义滚动条 */
.app-content__wrapper::-webkit-scrollbar {
  width: 8px;
}

.app-content__wrapper::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

.app-content__wrapper::-webkit-scrollbar-thumb {
  background: var(--color-border-dark);
  border-radius: var(--radius-round);
}

.app-content__wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}
</style>