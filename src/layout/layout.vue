<template>
  <div class="app-layout" :class="currentTheme">
    <!-- 顶部导航栏 -->
    <AppHeader
      :theme="currentTheme"
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
      @change-theme="themeStore.changeTheme"
    />
    
    <!-- 主体内容区域 -->
    <div class="app-main">
      <!-- 侧边栏 -->
      <aside class="app-sidebar" :class="{ collapsed: sidebarCollapsed, 'mobile-open': mobileSidebarOpen }">
        <nav class="app-sidebar__content">
          <ul class="sidebar-menu">
            <li class="sidebar-menu__item">
              <router-link 
                to="/" 
                class="sidebar-menu__link"
                :class="{ active: $route.path === '/' }"
                @click="closeMobileSidebar"
              >
                <span class="sidebar-menu__icon">🏠</span>
                <span class="sidebar-menu__text">首页</span>
              </router-link>
            </li>
            <li class="sidebar-menu__item">
              <router-link 
                to="/mine" 
                class="sidebar-menu__link"
                :class="{ active: $route.path === '/mine' }"
                @click="closeMobileSidebar"
              >
                <span class="sidebar-menu__icon">👤</span>
                <span class="sidebar-menu__text">个人中心</span>
              </router-link>
            </li>
            <li class="sidebar-menu__item">
              <router-link 
                to="/discover" 
                class="sidebar-menu__link"
                :class="{ active: $route.path === '/discover' }"
                @click="closeMobileSidebar"
              >
                <span class="sidebar-menu__icon">🎵</span>
                <span class="sidebar-menu__text">发现音乐</span>
              </router-link>
            </li>
            <li class="sidebar-menu__item">
              <router-link 
                to="/playlist" 
                class="sidebar-menu__link"
                :class="{ active: $route.path === '/playlist' }"
                @click="closeMobileSidebar"
              >
                <span class="sidebar-menu__icon">📚</span>
                <span class="sidebar-menu__text">播放列表</span>
              </router-link>
            </li>
            <li class="sidebar-menu__item">
              <router-link 
                to="/rank"
                class="sidebar-menu__link"
                :class="{ active: $route.path === '/rank' }"
                @click="closeMobileSidebar"
              >
                <span class="sidebar-menu__icon">🏆</span>
                <span class="sidebar-menu__text">排行榜</span>
              </router-link>
            </li>
          </ul>
        </nav>
      </aside>
      
      <!-- 主内容区域 -->
      <main class="app-content">
        <AppMain />
      </main>
    </div>
    
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && mobileSidebarOpen" 
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import AppHeader from './head.vue'
import AppMain from './main.vue'
import { useThemeStore } from '../stores/theme.js'

// 响应式数据
const route = useRoute()
const themeStore = useThemeStore()
const { currentTheme } = storeToRefs(themeStore)
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)
const isMobile = ref(false)

// 检查是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    mobileSidebarOpen.value = false
  }
}

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  if (isMobile.value) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

// 关闭移动端侧边栏
const closeMobileSidebar = () => {
  if (isMobile.value) {
    mobileSidebarOpen.value = false
  }
}


// 监听窗口大小变化
const handleResize = () => {
  checkMobile()
}

// 生命周期钩子
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 移动端遮罩层 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-index-modal-backdrop);
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* 侧边栏动画响应 */
.app-sidebar {
  transition: transform var(--transition-normal) var(--ease-out);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-sidebar {
    transform: translateX(-100%);
  }
  
  .app-sidebar.mobile-open {
    transform: translateX(0);
  }
}

/* 侧边栏菜单项图标样式 */
.sidebar-menu__icon {
  font-size: 16px;
  text-align: center;
}

/* 确保路由链接样式正确 */
.sidebar-menu__link {
  text-decoration: none;
  user-select: none;
}

.sidebar-menu__link:hover {
  text-decoration: none;
}

.sidebar-menu__link.active {
  color: var(--color-text-inverse);
}

.sidebar-menu__link.active .sidebar-menu__icon {
  color: var(--color-text-inverse);
}
</style>