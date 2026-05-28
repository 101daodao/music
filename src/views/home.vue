<template>
  <div class="home-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <el-icon :size="28"><Headset /></el-icon> 欢迎来到101云音乐
      </h1>
      <p class="page-subtitle">发现好音乐，享受精彩生活</p>
    </div>
    
    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 轮播图区域 -->
      <section class="page-section carousel-section">
        <Carousel
          v-if="carouselItems.length > 0"
          :items="carouselItems"
          :autoplay="true"
          :interval="4000"
          @item-click="handleCarouselItemClick"
        />
        <div v-else-if="loading" class="loading-placeholder">
          加载中...
        </div>
      </section>

      <!-- 分隔线 -->
      <div class="page-divider"></div>

      <!-- 推荐音乐区域 -->
      <section class="page-section recommend-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon :size="20"><TrendCharts /></el-icon> 热门推荐
          </h2>
          <button
            class="more-button"
            @click="toggleShowMore"
          >
            {{ showMore ? '收起' : '更多 ›' }}
          </button>
        </div>
        <div class="music-grid" :class="{ expanded: showMore }">
          <div
            v-for="(item, index) in displayRecommendMusic"
            :key="index"
            class="music-card"
            @click="playMusic(item)"
          >
            <div class="music-cover">
              <img
                :src="item.cover"
                :alt="item.title"
                @error="handleImageError"
              />
            </div>
            <div class="music-info">
              <h3 class="music-title">{{ item.title }}</h3>
              <p class="music-artist">{{ item.artist }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 分隔线 -->
      <div class="page-divider"></div>
      
      <!-- 最新音乐区域 -->
      <section class="page-section latest-section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon :size="20"><Clock /></el-icon> 最新音乐
          </h2>
        </div>
        <div class="music-grid">
          <div
            v-for="(item, index) in latestMusic"
            :key="index"
            class="music-card"
            @click="playMusic(item)"
          >
            <div class="music-cover">
              <img
                :src="item.cover"
                :alt="item.title"
                @error="handleImageError"
              />
            </div>
            <div class="music-info">
              <h3 class="music-title">{{ item.title }}</h3>
              <p class="music-artist">{{ item.artist }}</p>
              <p class="music-duration-small">{{ item.duration }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Headset, TrendCharts, Clock } from '@element-plus/icons-vue'
import { usePlayerStore } from '../stores/player.js'
import { musicService } from '../api/music.js'
import Carousel from '../components/Carousel.vue'

const playerStore = usePlayerStore()

// 响应式数据
const loading = ref(true)
const carouselItems = ref([])
const recommendMusic = ref([])
const showMore = ref(false)
const latestMusic = ref([])
// 计算属性：显示的热门歌曲
const displayRecommendMusic = computed(() => {
  return showMore.value ? recommendMusic.value : recommendMusic.value.slice(0, 10)
})

// 方法
const playMusic = async (music) => {
  console.log('播放音乐:', music.title)
  // 确保数据格式正确，包含所有必要字段
  const formattedMusic = {
    id: music.id,
    title: music.title,
    artist: music.artist,
    album: music.album || '未知专辑',
    cover: music.cover || 'https://picsum.photos/200/200?default=fallback',
    duration: typeof music.duration === 'number' ? music.duration : 0
  }
  // 将音乐添加到播放列表并播放
  await playerStore.playSong(formattedMusic)
}

// 处理轮播图点击
const handleCarouselItemClick = (item) => {
  console.log('点击轮播图项目:', item.title)
  // 直接播放点击的歌曲，确保字段格式与播放器Store一致
  playerStore.playSong({
    id: item.id,
    title: item.title,
    artist: item.artist,
    album: item.album || '未知专辑',
    cover: item.cover || 'https://picsum.photos/200/200?default=fallback',
    duration: item.duration || 0
  })
}

// 加载轮播图数据
const loadCarouselData = async () => {
  try {
    const result = await musicService.getCarouselData(5)
    if (result.success) {
      carouselItems.value = result.data.map(item => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        cover: item.cover,
        album: item.album || '未知专辑'
      }))
    }
  } catch (error) {
    console.error('加载轮播图数据失败:', error)
  }
}

// 加载推荐音乐（使用歌手歌曲API）
const loadRecommendMusic = async () => {
  try {
    // 使用热门歌手ID 6452 获取热门歌曲
    const result = await musicService.getArtistSongs(6452, {
      order: 'hot',
      limit: 20,
      offset: 0
    })
    
    if (result.success) {
      recommendMusic.value = result.data.map(item => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        cover: item.cover,
        album: item.album || '未知专辑',
        duration: item.duration
      }))
      console.log('推荐音乐加载成功:', recommendMusic.value.length, '首歌曲')
    } else {
      console.error('推荐音乐加载失败:', result.error)
    }
  } catch (error) {
    console.error('加载推荐音乐失败:', error)
  }
}

// 处理图片加载错误
const handleImageError = (event) => {
  console.log('图片加载失败:', event.target.src)
}

// 切换显示更多
const toggleShowMore = () => {
  showMore.value = !showMore.value
  console.log('切换显示状态:', showMore.value ? '展开' : '收起')
}

// 格式化时长
const formatDuration = (ms) => {
  if (!ms) return '0:00'
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 加载最新音乐
const loadLatestMusic = async () => {
  try {
    const result = await musicService.getPersonalizedNewSongs(10)
    if (result.success) {
      latestMusic.value = result.data.map(item => ({
        id: item.id,
        title: item.title || '未知歌曲',
        artist: item.artist || '未知歌手',
        cover: item.cover || 'https://picsum.photos/200/200',
        album: item.album || '未知专辑',
        duration: formatDuration(item.duration)
      }))
      console.log('最新音乐加载成功:', latestMusic.value.length, '首歌曲')
    } else {
      console.error('最新音乐加载失败:', result.error)
    }
  } catch (error) {
    console.error('加载最新音乐失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  try {
    loading.value = true
    await Promise.all([
      loadCarouselData(),
      loadRecommendMusic(),
      loadLatestMusic()
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 页面整体样式 */
.home-page {
  animation: pageFadeIn 0.6s ease-out;
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 页面内容区域 */
.page-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 页面区块 */
.page-section {
  padding: var(--spacing-xl) 0;
}

/* 分隔线 */
.page-divider {
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-primary) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: gradientMove 3s ease-in-out infinite;
  margin: var(--spacing-xxl) 0;
  border-radius: var(--radius-round);
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 轮播图区域 */
.carousel-section {
  min-height: 300px;
}

.loading-placeholder {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
}

/* 区块标题样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.more-button {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast) var(--ease-out);
}

.more-button:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  transform: translateX(2px);
}

.more-button:active {
  transform: scale(0.98);
}

/* 推荐音乐和最新音乐网格 */
.music-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-lg);
  transition: all var(--transition-normal) var(--ease-out);
}

.music-grid.expanded {
  /* 展开时显示所有内容 */
}

.music-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.music-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.music-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
}

.music-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal) var(--ease-out);
}

.music-card:hover .music-cover img {
  transform: scale(1.05);
}

.music-info {
  padding: var(--spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.music-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-artist {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-duration-small {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-top: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .music-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }
  
  .section-title {
    font-size: var(--font-size-lg);
  }
  
  .page-section {
    padding: var(--spacing-lg) 0;
  }
  
  .page-divider {
    margin: var(--spacing-lg) 0;
  }
}

@media (max-width: 480px) {
  .music-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: var(--spacing-sm);
  }
}
</style>