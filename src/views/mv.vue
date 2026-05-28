<template>
  <div class="mv-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <el-icon :size="28"><VideoPlay /></el-icon> MV推荐
      </h1>
      <p class="page-subtitle">发现精彩MV，享受视觉盛宴</p>
    </div>
    
    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 标签页切换 -->
      <div class="mv-tabs">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'personalized' }"
          @click="activeTab = 'personalized'"
        >
          <el-icon><TrendCharts /></el-icon>
          <span>推荐MV</span>
          <span class="tab-count">{{ personalizedMVList.length }}</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'exclusive' }"
          @click="activeTab = 'exclusive'"
        >
          <el-icon><StarFilled /></el-icon>
          <span>网易出品</span>
          <span class="tab-count">{{ exclusiveMVList.length }}</span>
        </div>
      </div>

      <!-- 推荐MV列表 -->
      <section v-show="activeTab === 'personalized'" class="mv-section">
        <div v-if="loadingPersonalized" class="loading-container">
          <el-icon class="is-loading" :size="40"><Loading /></el-icon>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="personalizedMVList.length === 0" class="empty-container">
          <el-empty description="暂无推荐MV数据" />
        </div>
        
        <div v-else class="mv-grid">
          <div
            v-for="mv in personalizedMVList"
            :key="mv.id"
            class="mv-card"
            @click="playMV(mv)"
          >
            <div class="mv-cover">
              <img
                :src="mv.coverUrl"
                :alt="mv.name"
                @error="handleImageError"
              />
              <div class="play-overlay">
                <el-icon :size="40"><VideoPlay /></el-icon>
              </div>
              <div class="play-count">
                <el-icon :size="12"><View /></el-icon>
                {{ formatPlayCount(mv.playCount) }}
              </div>
            </div>
            <div class="mv-info">
              <h3 class="mv-name">{{ mv.name }}</h3>
              <p class="mv-artist">{{ mv.artistName }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 网易出品MV列表 -->
      <section v-show="activeTab === 'exclusive'" class="mv-section">
        <div v-if="loadingExclusive" class="loading-container">
          <el-icon class="is-loading" :size="40"><Loading /></el-icon>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="exclusiveMVList.length === 0" class="empty-container">
          <el-empty description="暂无网易出品MV数据" />
        </div>
        
        <div v-else class="mv-grid">
          <div
            v-for="mv in exclusiveMVList"
            :key="mv.id"
            class="mv-card"
            @click="playMV(mv)"
          >
            <div class="mv-cover">
              <img
                :src="mv.coverUrl"
                :alt="mv.name"
                @error="handleImageError"
              />
              <div class="play-overlay">
                <el-icon :size="40"><VideoPlay /></el-icon>
              </div>
              <div class="play-count">
                <el-icon :size="12"><View /></el-icon>
                {{ formatPlayCount(mv.playCount) }}
              </div>
            </div>
            <div class="mv-info">
              <h3 class="mv-name">{{ mv.name }}</h3>
              <p class="mv-artist">{{ mv.artistName }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- MV播放弹窗 -->
      <el-dialog
        v-model="showPlayerDialog"
        title="MV播放"
        :width="dialogWidth"
        :close-on-click-modal="false"
        @close="closePlayer"
      >
        <div class="mv-player-container">
          <div v-if="loadingMV" class="mv-loading">
            <el-icon class="is-loading" :size="50"><Loading /></el-icon>
            <p>加载中...</p>
          </div>
          <div v-else-if="currentMVUrl" class="mv-video-wrapper">
            <video
              ref="videoRef"
              :src="currentMVUrl"
              controls
              autoplay
              class="mv-video"
              @error="handleVideoError"
            ></video>
          </div>
          <div v-else class="mv-error">
            <el-icon :size="50"><VideoPause /></el-icon>
            <p>视频加载失败</p>
          </div>
        </div>
        
        <template #footer v-if="currentMV">
          <div class="mv-info-footer">
            <h3>{{ currentMV.name }}</h3>
            <p>{{ currentMV.artistName }}</p>
            <p v-if="currentMV.desc" class="mv-desc">{{ currentMV.desc }}</p>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { VideoPlay, Loading, View, VideoPause, TrendCharts, StarFilled } from '@element-plus/icons-vue'
import { musicService } from '../api/music.js'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '../stores/theme.js'

const themeStore = useThemeStore()
const { currentTheme } = storeToRefs(themeStore)

// 响应式数据
const activeTab = ref('personalized')
const loadingPersonalized = ref(true)
const loadingExclusive = ref(true)
const personalizedMVList = ref([])
const exclusiveMVList = ref([])
const showPlayerDialog = ref(false)
const loadingMV = ref(false)
const currentMV = ref(null)
const currentMVUrl = ref('')
const videoRef = ref(null)
const dialogWidth = computed(() => {
  // 根据屏幕宽度调整弹窗宽度
  return window.innerWidth <= 768 ? '90%' : '70%'
})

// 格式化播放量
const formatPlayCount = (count) => {
  if (!count) return '0'
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿'
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = 'https://picsum.photos/300/170?default=fallback'
}

// 处理视频加载错误
const handleVideoError = () => {
  console.error('视频加载失败')
  currentMVUrl.value = ''
}

// 加载推荐MV
const loadPersonalizedMV = async () => {
  try {
    loadingPersonalized.value = true
    // 同时获取推荐MV和MV排行，合并数据
    const [personalizedResult, toplistResult] = await Promise.all([
      musicService.getPersonalizedMV(),
      musicService.getMvToplist(20)
    ])
    
    if (personalizedResult.success && toplistResult.success) {
      // 合并两个列表的MV
      personalizedMVList.value = [...personalizedResult.data, ...toplistResult.data]
      console.log('推荐MV加载成功:', personalizedMVList.value.length, '个视频')
    } else {
      console.error('推荐MV加载失败')
    }
  } catch (error) {
    console.error('加载推荐MV失败:', error)
  } finally {
    loadingPersonalized.value = false
  }
}

// 加载网易出品MV
const loadExclusiveMV = async () => {
  try {
    loadingExclusive.value = true
    const result = await musicService.getExclusiveMV({ limit: 30, offset: 0 })
    
    if (result.success) {
      exclusiveMVList.value = result.data
      console.log('网易出品MV加载成功:', exclusiveMVList.value.length, '个视频')
    } else {
      console.error('网易出品MV加载失败:', result.error)
    }
  } catch (error) {
    console.error('加载网易出品MV失败:', error)
  } finally {
    loadingExclusive.value = false
  }
}

// 播放MV
const playMV = async (mv) => {
  try {
    loadingMV.value = true
    showPlayerDialog.value = true
    currentMV.value = mv
    currentMVUrl.value = ''
    
    // 获取MV播放地址
    const urlResult = await musicService.getMVUrl(mv.id)
    if (urlResult.success && urlResult.data) {
      currentMVUrl.value = urlResult.data
    } else {
      console.error('获取MV播放地址失败')
    }
  } catch (error) {
    console.error('播放MV失败:', error)
  } finally {
    loadingMV.value = false
  }
}

// 关闭播放器
const closePlayer = () => {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.src = ''
  }
  currentMV.value = null
  currentMVUrl.value = ''
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadPersonalizedMV(),
    loadExclusiveMV()
  ])
})
</script>

<style scoped>
.mv-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: var(--color-bg-secondary);
  border-radius: 16px;
  color: var(--color-text-primary);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 0 16px 0;
  font-size: 32px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 2px;
  position: relative;
}

.page-title .el-icon {
  color: var(--color-primary);
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-secondary);
  position: relative;
}

/* 标签页 */
.mv-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  padding: 0 20px;
  overflow-x: auto;
  scrollbar-width: none;
}

.mv-tabs::-webkit-scrollbar {
  display: none;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--color-bg-secondary);
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border: 2px solid transparent;
}

.tab-item:hover {
  background: var(--color-bg-tertiary);
  transform: translateY(-2px);
}

.tab-item.active {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tab-item .el-icon {
  font-size: 16px;
}

.tab-count {
  padding: 2px 8px;
  background: var(--color-bg-primary);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.tab-item.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-text-inverse);
}

/* 加载容器 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: var(--color-text-secondary);
}

.loading-container .el-icon {
  color: var(--color-primary);
}

/* 空容器 */
.empty-container {
  padding: 80px 20px;
}

/* MV网格 */
.mv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 0;
}

/* MV卡片 */
.mv-card {
  background: var(--color-surface);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mv-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.mv-cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.mv-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mv-card:hover .mv-cover img {
  transform: scale(1.05);
}

/* 播放遮罩 */
.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mv-card:hover .play-overlay {
  opacity: 1;
}

.play-overlay .el-icon {
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* 播放量 */
.play-count {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 20px;
  color: white;
  font-size: 12px;
  backdrop-filter: blur(4px);
}

/* MV信息 */
.mv-info {
  padding: 16px;
}

.mv-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mv-artist {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* MV播放器容器 */
.mv-player-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  background: black;
  border-radius: 8px;
  overflow: hidden;
}

.mv-loading,
.mv-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: white;
}

.mv-loading .el-icon,
.mv-error .el-icon {
  color: var(--color-primary);
}

.mv-video-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.mv-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* MV信息底部 */
.mv-info-footer {
  text-align: center;
  padding: 20px 0 0 0;
}

.mv-info-footer h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.mv-info-footer > p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.mv-desc {
  margin-top: 12px !important;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
  line-height: 1.6;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .mv-page {
    padding: 12px;
  }
  
  .page-header {
    margin-bottom: 24px;
    padding: 24px 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .mv-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .mv-info {
    padding: 12px;
  }
  
  .mv-name {
    font-size: 14px;
  }
  
  .mv-artist {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .mv-grid {
    grid-template-columns: 1fr;
  }
}
</style>