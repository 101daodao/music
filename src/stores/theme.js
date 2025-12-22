import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const currentTheme = ref('theme-red')
  
  // 可用主题列表
  const availableThemes = [
    { id: 'theme-red', name: '热情红', icon: '🔴' },
    { id: 'theme-blue', name: '深邃蓝', icon: '🔵' },
    { id: 'theme-green', name: '自然绿', icon: '🟢' },
    { id: 'theme-purple', name: '优雅紫', icon: '🟣' },
    { id: 'theme-orange', name: '活力橙', icon: '🟠' },
    { id: 'theme-dark', name: '暗夜黑', icon: '⚫' }
  ]
  
  // 初始化主题
  const initTheme = () => {
    // 从本地存储获取保存的主题
    const savedTheme = localStorage.getItem('netease-theme')
    if (savedTheme && availableThemes.find(t => t.id === savedTheme)) {
      currentTheme.value = savedTheme
      applyTheme(savedTheme)
    } else {
      // 检查系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        currentTheme.value = 'theme-dark'
        applyTheme('theme-dark')
      } else {
        currentTheme.value = 'theme-red'
        applyTheme('theme-red')
      }
    }
  }
  
  // 切换主题
  const changeTheme = (theme) => {
    if (availableThemes.find(t => t.id === theme)) {
      currentTheme.value = theme
      applyTheme(theme)
      localStorage.setItem('netease-theme', theme)
      
      // 发布主题变化事件
      window.dispatchEvent(new CustomEvent('theme-changed', {
        detail: { theme }
      }))
    }
  }
  
  // 应用主题到DOM
  const applyTheme = (theme) => {
    // 更新 body 类名
    document.body.className = theme
    
    // 更新 HTML 元素的主题属性
    document.documentElement.setAttribute('data-theme', theme)
  }
  
  // 监听系统主题变化
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      // 只有在用户没有手动设置主题时才跟随系统
      const savedTheme = localStorage.getItem('netease-theme')
      if (!savedTheme) {
        const newTheme = e.matches ? 'theme-dark' : 'theme-red'
        changeTheme(newTheme)
      }
    })
  }
  
  // 获取当前主题信息
  const getCurrentThemeInfo = () => {
    return availableThemes.find(t => t.id === currentTheme.value) || availableThemes[0]
  }
  
  // 切换到下一个主题
  const nextTheme = () => {
    const currentIndex = availableThemes.findIndex(t => t.id === currentTheme.value)
    const nextIndex = (currentIndex + 1) % availableThemes.length
    changeTheme(availableThemes[nextIndex].id)
  }
  
  // 重置主题到默认
  const resetTheme = () => {
    localStorage.removeItem('netease-theme')
    initTheme()
  }
  
  return {
    // 状态
    currentTheme,
    availableThemes,
    
    // 方法
    initTheme,
    changeTheme,
    applyTheme,
    watchSystemTheme,
    getCurrentThemeInfo,
    nextTheme,
    resetTheme
  }
})