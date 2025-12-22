<template>
  <div id="app" :class="['app', currentTheme]">
    <!-- 主布局组件 -->
    <AppLayout />
    
    <!-- 音乐播放器 -->
    <MusicPlayer />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppLayout from './layout/layout.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import { useThemeStore } from './stores/theme.js'

const themeStore = useThemeStore()

// 解构主题状态和方法，保持响应性
const { currentTheme } = storeToRefs(themeStore)
const { initTheme, watchSystemTheme, nextTheme } = themeStore

// 键盘快捷键处理
const handleKeyboardShortcuts = (event) => {
  // Ctrl/Cmd + Shift + T: 快速切换主题
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
    event.preventDefault()
    nextTheme()
  }
}

// 生命周期
onMounted(() => {
  // 初始化主题
  initTheme()
  watchSystemTheme()
  
  // 设置应用基础配置
  document.documentElement.setAttribute('data-app-version', '1.0.0')
  
  // 添加键盘快捷键支持
  document.addEventListener('keydown', handleKeyboardShortcuts)
})

// 清理事件监听器
const cleanup = () => {
  document.removeEventListener('keydown', handleKeyboardShortcuts)
}

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
})
</script>

<style>
/* 导入全局样式 */
@import './styles/variables.css';
@import './styles/theme.css';
@import './styles/layout.css';

/* 应用根样式 */
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  line-height: var(--line-height-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* 全局重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-round);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-dark);
  border-radius: var(--radius-round);
  transition: background var(--transition-fast) var(--ease-out);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

/* 选择文本样式 */
::selection {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

::-moz-selection {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

/* 焦点样式 */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 链接样式 */
a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast) var(--ease-out);
}

a:hover {
  color: var(--color-primary-light);
}

/* 按钮基础样式 */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
  outline: none;
}

/* 输入框基础样式 */
input, textarea, select {
  font-family: inherit;
  font-size: inherit;
  outline: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast) var(--ease-out), box-shadow var(--transition-fast) var(--ease-out);
}

input:focus, textarea:focus, select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(194, 12, 12, 0.1);
}

/* 图片样式 */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 工具类 */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.d-none { display: none !important; }
.d-block { display: block !important; }
.d-flex { display: flex !important; }
.d-inline { display: inline !important; }
.d-inline-block { display: inline-block !important; }

.flex-center { 
  display: flex !important; 
  align-items: center !important; 
  justify-content: center !important; 
}

.flex-between { 
  display: flex !important; 
  align-items: center !important; 
  justify-content: space-between !important; 
}

.flex-column { 
  display: flex !important; 
  flex-direction: column !important; 
}

.flex-1 { flex: 1 !important; }

.w-100 { width: 100% !important; }
.h-100 { height: 100% !important; }

.overflow-hidden { overflow: hidden !important; }
.overflow-auto { overflow: auto !important; }
.overflow-scroll { overflow: scroll !important; }

.position-relative { position: relative !important; }
.position-absolute { position: absolute !important; }
.position-fixed { position: fixed !important; }

.cursor-pointer { cursor: pointer !important; }
.cursor-default { cursor: default !important; }

.user-select-none { 
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important; 
}

.text-ellipsis { 
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important; 
}

/* 间距工具类 */
.m-0 { margin: 0 !important; }
.mt-0 { margin-top: 0 !important; }
.mr-0 { margin-right: 0 !important; }
.mb-0 { margin-bottom: 0 !important; }
.ml-0 { margin-left: 0 !important; }

.p-0 { padding: 0 !important; }
.pt-0 { padding-top: 0 !important; }
.pr-0 { padding-right: 0 !important; }
.pb-0 { padding-bottom: 0 !important; }
.pl-0 { padding-left: 0 !important; }

/* 动画工具类 */
.transition { 
  transition: all var(--transition-normal) var(--ease-out) !important; 
}

.transition-fast { 
  transition: all var(--transition-fast) var(--ease-out) !important; 
}

.transition-slow { 
  transition: all var(--transition-slow) var(--ease-out) !important; 
}

/* 响应式工具类 */
@media (max-width: 768px) {
  .d-md-none { display: none !important; }
  .d-md-block { display: block !important; }
  .d-md-flex { display: flex !important; }
}

@media (max-width: 576px) {
  .d-sm-none { display: none !important; }
  .d-sm-block { display: block !important; }
  .d-sm-flex { display: flex !important; }
}

/* 打印样式 */
@media print {
  * {
    background: transparent !important;
    color: black !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
  
  .no-print {
    display: none !important;
  }
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  :root {
    --color-border: #000000;
    --color-text-primary: #000000;
    --color-bg-primary: #ffffff;
  }
}
</style>
