<template>
  <div class="home-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">🎵 欢迎来到网易云音乐</h1>
      <p class="page-subtitle">发现好音乐，享受精彩生活</p>
    </div>
    
    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 推荐音乐区域 -->
      <section class="recommend-section">
        <h2 class="section-title">🔥 热门推荐</h2>
        <div class="music-grid">
          <div 
            v-for="(item, index) in recommendMusic" 
            :key="index"
            class="music-card"
            @click="playMusic(item)"
          >
            <div class="music-cover">
              <img :src="item.cover" :alt="item.title" />
              <div class="play-overlay">
                <span class="play-icon">▶</span>
              </div>
            </div>
            <div class="music-info">
              <h3 class="music-title">{{ item.title }}</h3>
              <p class="music-artist">{{ item.artist }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 最新音乐区域 -->
      <section class="latest-section">
        <h2 class="section-title">🆕 最新音乐</h2>
        <div class="music-list">
          <div 
            v-for="(item, index) in latestMusic" 
            :key="index"
            class="music-item"
            @click="playMusic(item)"
          >
            <span class="music-index">{{ index + 1 }}</span>
            <div class="music-details">
              <h4 class="music-name">{{ item.title }}</h4>
              <p class="music-singer">{{ item.artist }}</p>
            </div>
            <span class="music-duration">{{ item.duration }}</span>
          </div>
        </div>
      </section>
      
      <!-- 统计数据区域 -->
      <section class="stats-section">
        <h2 class="section-title">📊 平台数据</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalSongs }}</div>
            <div class="stat-label">歌曲总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalArtists }}</div>
            <div class="stat-label">歌手数量</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalPlaylists }}</div>
            <div class="stat-label">歌单数量</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const recommendMusic = ref([
  {
    id: 1,
    title: '夜曲',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=1',
    duration: '3:46'
  },
  {
    id: 2,
    title: '晴天',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=2',
    duration: '4:29'
  },
  {
    id: 3,
    title: '告白气球',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=3',
    duration: '3:35'
  },
  {
    id: 4,
    title: '稻香',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=4',
    duration: '3:43'
  },
  {
    id: 5,
    title: '青花瓷',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=5',
    duration: '3:57'
  },
  {
    id: 6,
    title: '七里香',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=6',
    duration: '4:58'
  }
])

const latestMusic = ref([
  {
    id: 7,
    title: '最伟大的作品',
    artist: '周杰伦',
    duration: '3:52'
  },
  {
    id: 8,
    title: '等你下课',
    artist: '周杰伦',
    duration: '4:10'
  },
  {
    id: 9,
    title: '说好不哭',
    artist: '周杰伦',
    duration: '3:31'
  },
  {
    id: 10,
    title: 'Mojito',
    artist: '周杰伦',
    duration: '3:05'
  },
  {
    id: 11,
    title: '红颜如霜',
    artist: '周杰伦',
    duration: '4:22'
  }
])

const stats = ref({
  totalSongs: 5000,
  totalArtists: 500,
  totalPlaylists: 1000,
  activeUsers: '10万+'
})

// 方法
const playMusic = (music) => {
  console.log('播放音乐:', music.title)
  // 这里可以添加播放音乐的逻辑
  // 例如：调用音乐播放器API或跳转到播放页面
}

// 加载推荐音乐
const loadRecommendMusic = async () => {
  try {
    // 这里可以调用API获取推荐音乐数据
    console.log('加载推荐音乐...')
  } catch (error) {
    console.error('加载推荐音乐失败:', error)
  }
}

// 加载最新音乐
const loadLatestMusic = async () => {
  try {
    // 这里可以调用API获取最新音乐数据
    console.log('加载最新音乐...')
  } catch (error) {
    console.error('加载最新音乐失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadRecommendMusic()
  loadLatestMusic()
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

/* 区块标题样式 */
.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-primary);
  display: inline-block;
}

/* 推荐音乐网格 */
.music-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xxl);
}

.music-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
  box-shadow: var(--shadow-sm);
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

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal) var(--ease-out);
}

.music-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  color: var(--color-text-inverse);
  font-size: var(--font-size-xl);
  background: var(--color-primary);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.music-info {
  padding: var(--spacing-md);
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 最新音乐列表 */
.music-list {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--spacing-xxl);
}

.music-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color var(--transition-fast) var(--ease-out);
}

.music-item:last-child {
  border-bottom: none;
}

.music-item:hover {
  background-color: var(--color-bg-tertiary);
}

.music-index {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-tertiary);
  width: 30px;
  text-align: center;
}

.music-details {
  flex: 1;
  margin-left: var(--spacing-md);
}

.music-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.music-singer {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.music-duration {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

/* 统计数据网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.stat-card {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  padding: var(--spacing-xl) var(--spacing-lg);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: transform var(--transition-normal) var(--ease-out);
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: var(--font-size-xxxl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  font-size: var(--font-size-base);
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .music-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  
  .section-title {
    font-size: var(--font-size-lg);
  }
}

@media (max-width: 576px) {
  .music-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .music-item {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .music-index {
    width: 25px;
    font-size: var(--font-size-base);
  }
}
</style>