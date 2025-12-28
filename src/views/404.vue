<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-visual">
        <div class="error-number">4</div>
        <div class="error-icon">
          <el-icon :size="64"><Headset /></el-icon>
        </div>
        <div class="error-number">4</div>
      </div>
      
      <h1 class="error-title">页面找不到</h1>
      <p class="error-description">
        抱歉，您访问的页面不存在或已被移除
      </p>
      
      <div class="error-actions">
        <button class="primary-btn" @click="goHome">
          <el-icon :size="16"><HomeFilled /></el-icon> 返回首页
        </button>
        <button class="secondary-btn" @click="goBack">
          <el-icon :size="16"><ArrowLeft /></el-icon> 返回上页
        </button>
      </div>
      
      <div class="suggestions">
        <h3>您可能在寻找：</h3>
        <div class="suggestion-links">
          <router-link to="/" class="suggestion-link">
            <el-icon :size="18"><Headset /></el-icon> 首页 - 发现音乐
          </router-link>
          <router-link to="/discover" class="suggestion-link">
            <el-icon :size="18"><Search /></el-icon> 发现音乐
          </router-link>
          <router-link to="/mine" class="suggestion-link">
            <el-icon :size="18"><User /></el-icon> 个人中心
          </router-link>
          <router-link to="/playlist" class="suggestion-link">
            <el-icon :size="18"><FolderOpened /></el-icon> 我的歌单
          </router-link>
          <router-link to="/rank" class="suggestion-link">
            <el-icon :size="18"><Trophy /></el-icon> 音乐排行榜
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- 装饰元素 -->
    <div class="decoration-elements">
      <div class="music-note note-1">
        <el-icon :size="24"><Service /></el-icon>
      </div>
      <div class="music-note note-2">
        <el-icon :size="32"><Headset /></el-icon>
      </div>
      <div class="music-note note-3">
        <el-icon :size="28"><Microphone /></el-icon>
      </div>
      <div class="music-note note-4">
        <el-icon :size="24"><Service /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Headset, HomeFilled, ArrowLeft, Search, User, FolderOpened, Trophy, Service, Microphone } from '@element-plus/icons-vue'

const router = useRouter()

// 方法
const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-primary);
  position: relative;
  overflow: hidden;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  padding: var(--spacing-xl);
  z-index: 1;
  position: relative;
}

/* 错误视觉效果 */
.error-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
  gap: var(--spacing-md);
}

.error-number {
  font-size: 120px;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: 1;
  animation: bounce 2s infinite;
}

.error-icon {
  font-size: 80px;
  animation: rotate 3s linear infinite;
}

.error-number:nth-child(3) {
  animation-delay: 0.5s;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 错误信息 */
.error-title {
  font-size: var(--font-size-xxxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.error-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: var(--line-height-relaxed);
}

/* 操作按钮 */
.error-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xxl);
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  text-decoration: none;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.primary-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.primary-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.secondary-btn {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.secondary-btn:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-2px);
}

/* 建议链接 */
.suggestions {
  text-align: left;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.suggestions h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.suggestion-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.suggestion-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  transition: all var(--transition-fast) var(--ease-out);
  font-size: var(--font-size-base);
}

.suggestion-link:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-primary);
  transform: translateX(4px);
}

/* 装饰元素 */
.decoration-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.music-note {
  position: absolute;
  font-size: var(--font-size-xl);
  color: var(--color-border);
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.note-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.note-2 {
  top: 20%;
  right: 15%;
  animation-delay: 1s;
}

.note-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 2s;
}

.note-4 {
  bottom: 15%;
  right: 10%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(10deg);
  }
  50% {
    transform: translateY(-10px) rotate(-5deg);
  }
  75% {
    transform: translateY(-15px) rotate(5deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-content {
    padding: var(--spacing-lg);
    margin: var(--spacing-md);
  }
  
  .error-visual {
    gap: var(--spacing-sm);
  }
  
  .error-number {
    font-size: 80px;
  }
  
  .error-icon {
    font-size: 60px;
  }
  
  .error-title {
    font-size: var(--font-size-xxl);
  }
  
  .error-description {
    font-size: var(--font-size-base);
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-btn,
  .secondary-btn {
    width: 200px;
    justify-content: center;
  }
  
  .suggestions {
    margin-top: var(--spacing-lg);
  }
  
  .music-note {
    font-size: var(--font-size-lg);
  }
}

@media (max-width: 480px) {
  .error-number {
    font-size: 60px;
  }
  
  .error-icon {
    font-size: 40px;
  }
  
  .error-title {
    font-size: var(--font-size-xl);
  }
}
</style>