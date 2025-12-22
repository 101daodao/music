<template>
  <header class="app-header">
    <div class="app-header__content">
      <!-- 左侧区域：Logo和菜单按钮 -->
      <div class="app-header__left">
        <!-- 移动端菜单按钮 -->
        <button 
          class="menu-toggle"
          @click="$emit('toggleSidebar')"
          v-if="showMobileMenu"
        >
          <span class="menu-icon">☰</span>
        </button>
        
        <!-- 桌面端折叠按钮 -->
        <button 
          class="sidebar-toggle"
          @click="$emit('toggleSidebar')"
          v-if="!showMobileMenu"
        >
          <span class="menu-icon" :class="{ rotated: sidebarCollapsed }">◀</span>
        </button>
        
        <!-- Logo -->
        <router-link to="/" class="app-logo">
          <div class="app-logo__icon">🎵</div>
          <span class="app-logo__text">网易云音乐</span>
        </router-link>
      </div>
      
      <!-- 中间区域：搜索框 -->
      <div class="app-header__center">
        <SearchBox @search="handleSearch" @select-song="handleSelectSong" />
      </div>
      
      <!-- 右侧区域：用户信息和主题切换器 -->
      <div class="app-header__right">
        <!-- 主题切换器 -->
        <div class="theme-switcher" @click="toggleThemeDropdown">
          <div class="theme-switcher__current">
            <span class="theme-icon">🎨</span>
            <span class="theme-text">主题</span>
          </div>
          
          <div class="theme-switcher__dropdown" :class="{ show: showThemeDropdown }" @click.stop>
            <div 
              class="theme-option" 
              data-theme="red"
              @click="changeTheme('theme-red')"
            >
              <span class="theme-option__preview"></span>
              <span class="theme-option__name">热情红</span>
            </div>
            <div 
              class="theme-option" 
              data-theme="blue"
              @click="changeTheme('theme-blue')"
            >
              <span class="theme-option__preview"></span>
              <span class="theme-option__name">深邃蓝</span>
            </div>
            <div 
              class="theme-option" 
              data-theme="green"
              @click="changeTheme('theme-green')"
            >
              <span class="theme-option__preview"></span>
              <span class="theme-option__name">自然绿</span>
            </div>
            <div 
              class="theme-option" 
              data-theme="purple"
              @click="changeTheme('theme-purple')"
            >
              <span class="theme-option__preview"></span>
              <span class="theme-option__name">优雅紫</span>
            </div>
            <div 
              class="theme-option" 
              data-theme="orange"
              @click="changeTheme('theme-orange')"
            >
              <span class="theme-option__preview"></span>
              <span class="theme-option__name">活力橙</span>
            </div>
            <div 
              class="theme-option" 
              data-theme="dark"
              @click="changeTheme('theme-dark')"
            >
              <span class="theme-option__preview"></span>
              <span class="theme-option__name">暗夜黑</span>
            </div>
          </div>
        </div>
        
        <!-- 用户信息 -->
        <div class="user-info">
          <div class="user-avatar">U</div>
          <span class="user-name">用户</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SearchBox from '../components/SearchBox.vue'

// Props
const props = defineProps({
  theme: {
    type: String,
    default: 'theme-red'
  },
  sidebarCollapsed: {
    type: Boolean,
    default: false
  },
  showMobileMenu: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['toggleSidebar', 'changeTheme'])

// 响应式数据
const showThemeDropdown = ref(false)
const isMobile = ref(false)

// 计算属性
const currentThemeText = computed(() => {
  const themeMap = {
    'theme-red': '热情红',
    'theme-blue': '深邃蓝',
    'theme-green': '自然绿',
    'theme-purple': '优雅紫',
    'theme-orange': '活力橙',
    'theme-dark': '暗夜黑'
  }
  return themeMap[props.theme] || '热情红'
})

// 方法
const handleSearch = (query) => {
  console.log('搜索:', query)
  // 这里可以添加实际的搜索逻辑
  // 例如：跳转到搜索页面或触发搜索事件
}

const handleSelectSong = (song) => {
  console.log('选择歌曲:', song.title)
  // 这里可以添加播放歌曲的逻辑
  const musicPlayer = document.querySelector('music-player')
  if (musicPlayer) {
    musicPlayer.playSong(song)
  }
}

const changeTheme = (theme) => {
  emit('changeTheme', theme)
  showThemeDropdown.value = false
}

const toggleThemeDropdown = () => {
  showThemeDropdown.value = !showThemeDropdown.value
}

// 检查是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 清理事件监听器
const handleClickOutside = (event) => {
  const themeSwitcher = document.querySelector('.theme-switcher')
  if (themeSwitcher && !themeSwitcher.contains(event.target)) {
    showThemeDropdown.value = false
  }
}

// 生命周期
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  // 点击外部关闭下拉菜单
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时清理事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 菜单切换按钮 */
.menu-toggle,
.sidebar-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-toggle:hover,
.sidebar-toggle:hover {
  background-color: var(--color-bg-tertiary);
}

.menu-icon {
  font-size: 18px;
  color: var(--color-text-primary);
  transition: transform var(--transition-normal) var(--ease-out);
}

.menu-icon.rotated {
  transform: rotate(180deg);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sidebar-toggle {
    display: none;
  }
  
  .sidebar-logo__text {
    display: none;
  }
}

@media (min-width: 769px) {
  .menu-toggle {
    display: none;
  }
}

/* 主题切换器样式增强 */
.theme-switcher {
  position: relative;
  user-select: none;
}

.theme-icon {
  font-size: 16px;
}

.theme-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

/* 用户信息样式增强 */
.user-info:hover {
  cursor: pointer;
}

/* 搜索框焦点效果 */
.search-box__input:focus {
  outline: none;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .app-header__center {
    max-width: 150px;
  }
  
  .user-name {
    display: none;
  }
  
  .theme-text {
    display: none;
  }
}

@media (max-width: 576px) {
  .app-header__center {
    display: none;
  }
}

/* Logo 动画效果 */
.app-logo:hover .app-logo__icon {
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* 搜索建议下拉框（预留） */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 300px;
  overflow-y: auto;
  z-index: var(--z-index-dropdown);
}

/* 主题切换动画 */
.theme-option {
  transition: all var(--transition-fast) var(--ease-out);
}

.theme-option:hover {
  transform: translateX(4px);
}

/* 用户头像动画 */
.user-avatar:hover {
  transform: scale(1.1);
  transition: transform var(--transition-fast) var(--ease-out);
}
</style>