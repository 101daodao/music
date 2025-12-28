<template>
  <div class="rank-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <el-icon :size="36" color="#409EFF"><Trophy /></el-icon> 
        排行榜
      </h1>
      <p class="page-subtitle">
        <el-icon><DataLine /></el-icon>
        发现最受欢迎的音乐作品
      </p>
    </div>
    
    <!-- 骨架屏加载 -->
    <div v-if="loading" class="skeleton-container">
      <div class="ranks-grid">
        <div v-for="i in 10" :key="i" class="skeleton-card">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="image" class="skeleton-image" />
              <div class="skeleton-content">
                <el-skeleton-item variant="h3" class="skeleton-title" />
                <el-skeleton-item variant="text" class="skeleton-text" />
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="!allRanks.length" class="empty-container">
      <el-empty description="暂无榜单数据">
        <el-button type="primary" @click="loadRankList">重新加载</el-button>
      </el-empty>
    </div>
    
    <!-- 页面内容 -->
    <div v-else class="page-content">
      <div class="ranks-grid-full">
        <el-card
          v-for="(rank, index) in allRanks"
          :key="rank.id"
          class="rank-card"
          :body-style="{ padding: '0' }"
          shadow="hover"
          @click="goToPlaylist(rank.id)"
        >
          <div class="card-cover">
            <el-image
              :src="rank.coverImgUrl"
              :alt="rank.name"
              fit="cover"
              :lazy="true"
              class="cover-image"
            >
              <template #placeholder>
                <div class="image-placeholder">
                  <el-icon :size="32"><Loading /></el-icon>
                </div>
              </template>
              <template #error>
                <div class="image-error">
                  <el-icon :size="32"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            
            <div v-if="index < 3" :class="['rank-badge', `rank-${index}`]" />
          </div>
          
          <div class="card-body">
            <div class="rank-name" :title="rank.name">
              <el-tag v-if="index < 3" :type="getTagType(index)" size="small" effect="plain">
                TOP {{ index + 1 }}
              </el-tag>
              {{ rank.name }}
            </div>
            <div class="rank-meta">
              <span class="play-count">
                <el-icon><Headset /></el-icon>
                {{ formatPlayCount(rank.playCount) }}
              </span>
              <span class="song-count" v-if="rank.trackCount">
                <el-icon><Folder /></el-icon>
                {{ rank.trackCount }}首
              </span>
            </div>
            <div class="rank-time" v-if="rank.updateTime || rank.updateFrequency">
              <el-icon><Clock /></el-icon>
              {{ rank.updateFrequency || '每日更新' }}
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { musicService, formatPlayCount } from '../api/music.js'
import { ElMessage } from 'element-plus'
import { 
  Trophy, 
  Headset, 
  Picture, 
  Loading, 
  Folder,
  Clock,
  DataLine
} from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(true)
const allRanks = ref([])

// 获取标签类型
const getTagType = (index) => {
  const types = ['danger', 'warning', 'success']
  return types[index] || 'info'
}

// 加载榜单数据
const loadRankList = async () => {
  loading.value = true
  try {
    const result = await musicService.getToplist()
    
    if (result.success && result.data) {
      allRanks.value = result.data.sort((a, b) => {
        return b.updateTime - a.updateTime
      })
    } else {
      ElMessage.error('加载榜单失败：' + result.error)
    }
  } catch (error) {
    ElMessage.error('加载榜单出错：' + error.message)
  }
  
  loading.value = false
}

// 跳转到歌单详情
const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

onMounted(() => {
  loadRankList()
})
</script>

<style scoped>
/* 页面整体样式 - 不使用 Scoped 的深度选择器，直接定义 */
.rank-page {
  width: 100%;
  padding: var(--spacing-xl);
  animation: pageFadeIn 0.4s ease-out;
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xxl);
  padding: var(--spacing-xl) 0;
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

/* 暗色主题下的页面头部 */
:global(.theme-dark) .page-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2f2f2f 100%);
}

.page-title {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

/* 骨架屏容器 */
.skeleton-container {
  margin: var(--spacing-xl) 0;
}

.skeleton-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
}

.skeleton-content {
  padding: var(--spacing-md);
}

.skeleton-title {
  width: 80%;
  margin-bottom: var(--spacing-sm);
}

.skeleton-text {
  width: 50%;
}

/* 空状态容器 */
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 页面内容 */
.page-content {
  margin: var(--spacing-xl) 0;
}

/* 全屏网格布局 - 使用 calc 确保精确的 5 列 */
.ranks-grid-full {
  --column-count: 5;
  --gap-size: 20px;
  --total-gap: calc((var(--column-count) - 1) * var(--gap-size));
  --column-width: calc((100% - var(--total-gap)) / var(--column-count));
  
  display: grid;
  grid-template-columns: repeat(var(--column-count), var(--column-width));
  gap: var(--gap-size);
}

/* 排行榜卡片 */
.rank-card {
  height: 100%;
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
  border: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.rank-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.rank-card:hover {
  transform: translateY(-8px);
}

/* 卡片封面 */
.card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.cover-image {
  width: 100%;
  height: 100%;
}

.image-placeholder,
.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  color: var(--color-text-tertiary);
}

.image-placeholder .el-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 排行榜排名标识 */
.rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  color: white;
  font-size: var(--font-size-sm);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.rank-0 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%);
}

.rank-1 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
}

.rank-2 {
  background: linear-gradient(135deg, #cd7f32 0%, #e8a862 100%);
}

/* 卡片主体 */
.card-body {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.rank-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-name .el-tag {
  flex-shrink: 0;
}

.rank-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.play-count,
.song-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.play-count .el-icon,
.song-count .el-icon {
  font-size: 14px;
}

.rank-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.rank-time .el-icon {
  font-size: 12px;
}

/* 响应式调整 */
@media (max-width: 1400px) {
  .rank-page {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 1200px) {
  .ranks-grid-full {
    --column-count: 4;
  }
  
  .rank-page {
    padding: var(--spacing-md);
  }
}

@media (max-width: 900px) {
  .ranks-grid-full {
    --column-count: 3;
  }
}

@media (max-width: 768px) {
  .page-header {
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-lg) 0;
  }
  
  .page-title {
    font-size: var(--font-size-xl);
  }
  
  .card-body {
    padding: var(--spacing-sm);
  }
  
  .rank-name {
    font-size: var(--font-size-sm);
  }
  
  .rank-badge {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
  
  .ranks-grid-full {
    --column-count: 2;
    --gap-size: 16px;
  }
}

@media (max-width: 480px) {
  .ranks-grid-full {
    --column-count: 1;
  }
}
</style>