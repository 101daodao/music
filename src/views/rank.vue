<template>
  <div class="rank-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">🏆 排行榜</h1>
      <p class="page-subtitle">发现最受欢迎的音乐作品</p>
    </div>
    
    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 官方榜 -->
      <section class="official-rank-section">
        <h2 class="section-title">🎯 官方榜</h2>
        <div class="rank-grid">
          <div 
            v-for="(rank, index) in officialRanks" 
            :key="index"
            class="rank-card"
            @click="openRankDetail(rank)"
          >
            <div class="rank-header">
              <div class="rank-cover">
                <img :src="rank.cover" :alt="rank.name" />
                <div class="rank-badge">{{ rank.type }}</div>
              </div>
              <div class="rank-info">
                <h3 class="rank-name">{{ rank.name }}</h3>
                <p class="rank-desc">{{ rank.description }}</p>
                <p class="rank-time">{{ rank.updateTime }}更新</p>
              </div>
            </div>
            <div class="rank-songs">
              <div 
                v-for="(song, songIndex) in rank.songs.slice(0, 3)" 
                :key="songIndex"
                class="song-item"
                @click.stop="playSong(song)"
              >
                <span class="song-index" :class="{ top: songIndex < 3 }">{{ songIndex + 1 }}</span>
                <div class="song-details">
                  <h4 class="song-title">{{ song.title }}</h4>
                  <p class="song-artist">{{ song.artist }}</p>
                </div>
                <span class="song-hot-score">{{ song.hotScore }}</span>
              </div>
            </div>
            <button class="view-all-btn" @click.stop="openRankDetail(rank)">
              查看全部 ›
            </button>
          </div>
        </div>
      </section>
      
      <!-- 全球榜 -->
      <section class="global-rank-section">
        <h2 class="section-title">🌍 全球榜</h2>
        <div class="global-rank-grid">
          <div 
            v-for="(rank, index) in globalRanks" 
            :key="index"
            class="global-rank-card"
            @click="openRankDetail(rank)"
          >
            <div class="global-rank-cover">
              <img :src="rank.cover" :alt="rank.name" />
              <div class="global-rank-overlay">
                <span class="play-total">🎵 {{ rank.playCount }}</span>
              </div>
            </div>
            <div class="global-rank-info">
              <h4 class="global-rank-name">{{ rank.name }}</h4>
              <p class="global-rank-desc">{{ rank.description }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 特色榜 -->
      <section class="feature-rank-section">
        <h2 class="section-title">✨ 特色榜</h2>
        <div class="feature-rank-list">
          <div 
            v-for="(rank, index) in featureRanks" 
            :key="index"
            class="feature-rank-item"
            @click="openRankDetail(rank)"
          >
            <div class="feature-rank-icon">{{ rank.icon }}</div>
            <div class="feature-rank-content">
              <h4 class="feature-rank-name">{{ rank.name }}</h4>
              <p class="feature-rank-desc">{{ rank.description }}</p>
              <span class="feature-rank-tag">{{ rank.tag }}</span>
            </div>
            <div class="feature-rank-stats">
              <span class="update-time">{{ rank.updateTime }}</span>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 榜单统计 -->
      <section class="stats-section">
        <h2 class="section-title">📊 榜单统计</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalRanks }}</div>
            <div class="stat-label">榜单总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalSongs }}</div>
            <div class="stat-label">上榜歌曲</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.dailyUpdate }}</div>
            <div class="stat-label">每日更新</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalPlays }}</div>
            <div class="stat-label">总播放量</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const officialRanks = ref([
  {
    id: 1,
    name: '飙升榜',
    type: '🔥',
    description: '快速上升的热门歌曲',
    cover: 'https://picsum.photos/120/120?random=rank1',
    updateTime: '每日',
    songs: [
      { id: 1, title: '热门歌曲一', artist: '歌手A', hotScore: '98.5' },
      { id: 2, title: '热门歌曲二', artist: '歌手B', hotScore: '96.2' },
      { id: 3, title: '热门歌曲三', artist: '歌手C', hotScore: '94.8' }
    ]
  },
  {
    id: 2,
    name: '新歌榜',
    type: '🆕',
    description: '最新发布的优秀作品',
    cover: 'https://picsum.photos/120/120?random=rank2',
    updateTime: '每日',
    songs: [
      { id: 4, title: '新歌一', artist: '新人A', hotScore: '92.3' },
      { id: 5, title: '新歌二', artist: '新人B', hotScore: '90.1' },
      { id: 6, title: '新歌三', artist: '新人C', hotScore: '88.7' }
    ]
  },
  {
    id: 3,
    name: '原创榜',
    type: '🎵',
    description: '原创音乐作品排行',
    cover: 'https://picsum.photos/120/120?random=rank3',
    updateTime: '每周',
    songs: [
      { id: 7, title: '原创一', artist: '独立A', hotScore: '87.5' },
      { id: 8, title: '原创二', artist: '独立B', hotScore: '85.2' },
      { id: 9, title: '原创三', artist: '独立C', hotScore: '83.9' }
    ]
  },
  {
    id: 4,
    name: '热歌榜',
    type: '🎤',
    description: '最受欢迎的热门歌曲',
    cover: 'https://picsum.photos/120/120?random=rank4',
    updateTime: '实时',
    songs: [
      { id: 10, title: '热歌一', artist: '流行A', hotScore: '99.2' },
      { id: 11, title: '热歌二', artist: '流行B', hotScore: '97.8' },
      { id: 12, title: '热歌三', artist: '流行C', hotScore: '96.5' }
    ]
  }
])

const globalRanks = ref([
  {
    id: 101,
    name: 'Billboard榜',
    description: '美国公告牌排行榜',
    cover: 'https://picsum.photos/200/200?random=global1',
    playCount: '1245万'
  },
  {
    id: 102,
    name: 'UK单曲榜',
    description: '英国官方单曲排行榜',
    cover: 'https://picsum.photos/200/200?random=global2',
    playCount: '892万'
  },
  {
    id: 103,
    name: '日本公信榜',
    description: '日本Oricon排行榜',
    cover: 'https://picsum.photos/200/200?random=global3',
    playCount: '756万'
  },
  {
    id: 104,
    name: '韩国Melon榜',
    description: '韩国Melon音乐排行榜',
    cover: 'https://picsum.photos/200/200?random=global4',
    playCount: '634万'
  }
])

const featureRanks = ref([
  {
    id: 201,
    name: 'KTV热门榜',
    description: 'KTV点唱率最高的歌曲',
    icon: '🎤',
    tag: '娱乐',
    updateTime: '每周更新'
  },
  {
    id: 202,
    name: '电音榜',
    description: '电子音乐排行榜',
    icon: '🎧',
    tag: '电子',
    updateTime: '每日更新'
  },
  {
    id: 203,
    name: '古风榜',
    description: '中国古风音乐排行榜',
    icon: '🏮',
    tag: '古风',
    updateTime: '每周更新'
  },
  {
    id: 204,
    name: '说唱榜',
    description: '说唱音乐排行榜',
    icon: '🎙️',
    tag: '说唱',
    updateTime: '每周更新'
  }
])

const stats = ref({
  totalRanks: 28,
  totalSongs: '5.6万',
  dailyUpdate: 12,
  totalPlays: '12.8亿'
})

// 方法
const openRankDetail = (rank) => {
  console.log('打开榜单详情:', rank.name)
}

const playSong = (song) => {
  console.log('播放歌曲:', song.title)
}

// 生命周期
onMounted(() => {
  console.log('排行榜页面加载完成')
})
</script>

<style scoped>
/* 页面整体样式 */
.rank-page {
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

/* 官方榜网格 */
.rank-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xxl);
}

.rank-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
  box-shadow: var(--shadow-sm);
}

.rank-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.rank-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.rank-cover {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.rank-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rank-badge {
  position: absolute;
  top: var(--spacing-xs);
  left: var(--spacing-xs);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.rank-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.rank-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* 歌曲列表 */
.rank-songs {
  margin-bottom: var(--spacing-lg);
}

.song-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-fast) var(--ease-out);
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
}

.song-index {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-tertiary);
  width: 30px;
  text-align: center;
}

.song-index.top {
  color: var(--color-primary);
}

.song-details {
  flex: 1;
  margin-left: var(--spacing-md);
}

.song-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.song-artist {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.song-hot-score {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
}

.view-all-btn {
  width: 100%;
  background: none;
  border: 1px solid var(--color-border);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  font-size: var(--font-size-sm);
}

.view-all-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 全球榜网格 */
.global-rank-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xxl);
}

.global-rank-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
  box-shadow: var(--shadow-sm);
}

.global-rank-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.global-rank-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
}

.global-rank-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal) var(--ease-out);
}

.global-rank-card:hover .global-rank-cover img {
  transform: scale(1.05);
}

.global-rank-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: var(--spacing-md);
  opacity: 0;
  transition: opacity var(--transition-normal) var(--ease-out);
}

.global-rank-card:hover .global-rank-overlay {
  opacity: 1;
}

.play-total {
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
}

.global-rank-info {
  padding: var(--spacing-md);
}

.global-rank-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.global-rank-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 特色榜列表 */
.feature-rank-list {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--spacing-xxl);
}

.feature-rank-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color var(--transition-fast) var(--ease-out);
}

.feature-rank-item:last-child {
  border-bottom: none;
}

.feature-rank-item:hover {
  background-color: var(--color-bg-tertiary);
}

.feature-rank-icon {
  font-size: var(--font-size-xxl);
  margin-right: var(--spacing-lg);
}

.feature-rank-content {
  flex: 1;
}

.feature-rank-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.feature-rank-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.feature-rank-tag {
  display: inline-block;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.feature-rank-stats {
  font-size: var(--font-size-xs);
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
  .rank-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .global-rank-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--spacing-md);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  
  .rank-header {
    gap: var(--spacing-sm);
  }
  
  .rank-cover {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 576px) {
  .global-rank-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-rank-item {
    padding: var(--spacing-md);
  }
  
  .feature-rank-icon {
    font-size: var(--font-size-xl);
    margin-right: var(--spacing-md);
  }
}
</style>