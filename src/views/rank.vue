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
      <!-- 榜单推荐区域 -->
      <div v-if="recommendRanks.length" class="rank-section">
        <div class="section-header">
          <el-icon :size="20" color="#F56C6C"><Star /></el-icon>
          <h3 class="section-title">榜单推荐</h3>
        </div>
        <el-divider class="section-divider" />
        <div class="ranks-grid-full">
          <el-card
            v-for="rank in recommendRanks"
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
            </div>
          </el-card>
        </div>
      </div>

      <!-- 官方榜区域 -->
      <div v-if="officialRanks.length" class="rank-section">
        <div class="section-header">
          <el-icon :size="20" color="#409EFF"><Trophy /></el-icon>
          <h3 class="section-title">官方榜</h3>
          <el-button
            v-if="officialRanks.length > 5"
            text
            type="primary"
            @click="showAllOfficialRanks = !showAllOfficialRanks"
          >
            {{ showAllOfficialRanks ? '收起' : '更多' }}
            <el-icon>
              <component :is="showAllOfficialRanks ? 'ArrowUp' : 'ArrowDown'" />
            </el-icon>
          </el-button>
        </div>
        <el-divider class="section-divider" />
        <div class="ranks-grid-full">
          <el-card
            v-for="rank in displayedOfficialRanks"
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
            </div>
          </el-card>
        </div>
      </div>

      <!-- 精选榜区域 -->
      <div v-if="selectedRanks.length" class="rank-section">
        <div class="section-header">
          <el-icon :size="20" color="#E6A23C"><Medal /></el-icon>
          <h3 class="section-title">精选榜</h3>
        </div>
        <el-divider class="section-divider" />
        <div class="ranks-grid-full">
          <el-card
            v-for="rank in selectedRanks"
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
            </div>
          </el-card>
        </div>
      </div>

      <!-- 曲风榜区域 -->
      <div v-if="genreRanks.length" class="rank-section">
        <div class="section-header">
          <el-icon :size="20" color="#909399"><Headset /></el-icon>
          <h3 class="section-title">曲风榜</h3>
        </div>
        <el-divider class="section-divider" />
        <div class="ranks-grid-full">
          <el-card
            v-for="rank in genreRanks"
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
            </div>
          </el-card>
        </div>
      </div>

      <!-- 全球榜区域 -->
      <div v-if="globalRanks.length" class="rank-section">
        <div class="section-header">
          <el-icon :size="20" color="#67C23A"><Star /></el-icon>
          <h3 class="section-title">全球榜</h3>
        </div>
        <el-divider class="section-divider" />
        <div class="ranks-grid-full">
          <el-card
            v-for="rank in globalRanks"
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
            </div>
          </el-card>
        </div>
      </div>

      <!-- 语种榜区域 -->
      <div v-if="languageRanks.length" class="rank-section">
        <div class="section-header">
          <el-icon :size="20" color="#F56C6C"><List /></el-icon>
          <h3 class="section-title">语种榜</h3>
        </div>
        <el-divider class="section-divider" />
        <div class="ranks-grid-full">
          <el-card
            v-for="rank in languageRanks"
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
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { musicService } from '../api/music.js'
import { ElMessage } from 'element-plus'
import {
  Trophy,
  Headset,
  Picture,
  Loading,
  DataLine,
  Star,
  Medal,
  List,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(true)
const allRanks = ref([])

// 控制官方榜展开状态
const showAllOfficialRanks = ref(false)

// 榜单推荐（热度最高、播放量最大的榜单，取前5个）
const recommendRanks = computed(() => {
  if (!allRanks.value.length) return []
  return allRanks.value
    .filter(rank => rank.playCount)
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 5)
})

// 官方榜（包含"官方"、"榜"字，且非全球、语种、曲风类）
const officialRanks = computed(() => {
  return allRanks.value.filter(rank => {
    const name = rank.name || ''
    return name &&
      (name.includes('官方') || name.includes('榜')) &&
      !name.includes('全球') &&
      !name.includes('英国') &&
      !name.includes('美国') &&
      !name.includes('日本') &&
      !name.includes('韩国') &&
      !name.includes('法语') &&
      !name.includes('英语') &&
      !name.includes('日语') &&
      !name.includes('韩语') &&
      !name.includes('华语') &&
      !name.includes('DJ') &&
      !name.includes('摇滚') &&
      !name.includes('民谣') &&
      !name.includes('电音') &&
      !name.includes('说唱') &&
      !name.includes('轻音乐') &&
      !name.includes('古典') &&
      !name.includes('流行')
  })
})

// 显示的官方榜（根据展开状态返回前5个或全部）
const displayedOfficialRanks = computed(() => {
  if (!showAllOfficialRanks.value && officialRanks.value.length > 5) {
    return officialRanks.value.slice(0, 5)
  }
  return officialRanks.value
})

// 精选榜（各种特色榜单，如原创、新歌、上升、热歌、飙升等）
const selectedRanks = computed(() => {
  return allRanks.value.filter(rank => {
    const name = rank.name || ''
    return name && (
      name.includes('原创') ||
      name.includes('新歌') ||
      name.includes('上升') ||
      name.includes('热歌') ||
      name.includes('飙升') ||
      name.includes('达人') ||
      name.includes('Mlog') ||
      name.includes('云听')
    )
  })
})

// 曲风榜（DJ、摇滚、民谣、电音、说唱、轻音乐、古典、流行等）
const genreRanks = computed(() => {
  return allRanks.value.filter(rank => {
    const name = rank.name || ''
    return name && (
      name.includes('DJ') ||
      name.includes('电音') ||
      name.includes('说唱') ||
      name.includes('轻音乐') ||
      name.includes('古典') ||
      name.includes('摇滚') ||
      name.includes('民谣') ||
      name.includes('流行')
    )
  })
})

// 全球榜（包含全球、英国、美国、日本、韩国等）
const globalRanks = computed(() => {
  return allRanks.value.filter(rank => {
    const name = rank.name || ''
    return name && (
      name.includes('全球') ||
      name.includes('英国') ||
      name.includes('美国') ||
      name.includes('日本') ||
      name.includes('韩国') ||
      name.includes('UK') ||
      name.includes('Billboard')
    )
  })
})

// 语种榜（华语、英语、日语、韩语、法语等）
const languageRanks = computed(() => {
  return allRanks.value.filter(rank => {
    const name = rank.name || ''
    return name && (
      name.includes('华语') ||
      name.includes('英语') ||
      name.includes('日语') ||
      name.includes('韩语') ||
      name.includes('法语') ||
      name.includes('粤语')
    )
  })
})

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


/* 排行榜分区 */
.rank-section {
  margin-bottom: var(--spacing-xxl);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.section-header .el-button {
  margin-left: auto;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.section-divider {
  margin-bottom: var(--spacing-lg);
}

/* 卡片主体（移除文字内容） */
.card-body {
  display: none;
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
  
  .section-header {
    flex-direction: row;
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
  
  .ranks-grid-full {
    --column-count: 2;
    --gap-size: 16px;
  }
  
  .rank-section {
    margin-bottom: var(--spacing-xl);
  }
  
  .section-header .el-icon {
    width: 18px;
  }
  
  .section-title {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 480px) {
  .ranks-grid-full {
    --column-count: 2;
  }
}
</style>