<template>
  <div class="discover-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">🎵 发现音乐</h1>
      <p class="page-subtitle">探索更多精彩内容</p>
    </div>
    
    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 轮播图区域 -->
      <section class="banner-section">
        <div class="banner-carousel">
          <div class="banner-item" v-for="(banner, index) in banners" :key="index">
            <img :src="banner.image" :alt="banner.title" />
            <div class="banner-overlay">
              <h3>{{ banner.title }}</h3>
              <p>{{ banner.description }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 推荐歌单 -->
      <section class="playlist-section">
        <h2 class="section-title">🔥 推荐歌单</h2>
        <div class="playlist-grid">
          <div 
            v-for="(playlist, index) in recommendPlaylists" 
            :key="index"
            class="playlist-card"
            @click="openPlaylist(playlist)"
          >
            <div class="playlist-cover">
              <img :src="playlist.cover" :alt="playlist.name" />
              <div class="play-count">🎵 {{ playlist.playCount }}</div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <p class="playlist-desc">{{ playlist.description }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 新歌速递 -->
      <section class="new-songs-section">
        <h2 class="section-title">🆕 新歌速递</h2>
        <div class="songs-grid">
          <div 
            v-for="(song, index) in newSongs" 
            :key="index"
            class="song-card"
            @click="playSong(song)"
          >
            <div class="song-cover">
              <img :src="song.cover" :alt="song.title" />
              <div class="play-overlay">
                <span class="play-icon">▶</span>
              </div>
            </div>
            <div class="song-info">
              <h4 class="song-title">{{ song.title }}</h4>
              <p class="song-artist">{{ song.artist }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 热门歌手 -->
      <section class="artists-section">
        <h2 class="section-title">⭐ 热门歌手</h2>
        <div class="artists-grid">
          <div 
            v-for="(artist, index) in popularArtists" 
            :key="index"
            class="artist-card"
            @click="openArtist(artist)"
          >
            <div class="artist-avatar">
              <img :src="artist.avatar" :alt="artist.name" />
            </div>
            <h4 class="artist-name">{{ artist.name }}</h4>
            <p class="artist-songs">{{ artist.songCount }} 首歌曲</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const banners = ref([
  {
    id: 1,
    title: '夏日音乐节',
    description: '感受夏日的音乐狂欢',
    image: 'https://picsum.photos/800/300?random=banner1'
  },
  {
    id: 2,
    title: '新歌推荐',
    description: '最新最热的音乐作品',
    image: 'https://picsum.photos/800/300?random=banner2'
  },
  {
    id: 3,
    title: '经典老歌',
    description: '永恒的音乐回忆',
    image: 'https://picsum.photos/800/300?random=banner3'
  }
])

const recommendPlaylists = ref([
  {
    id: 1,
    name: '私人推荐',
    description: '根据你的喜好定制',
    cover: 'https://picsum.photos/200/200?random=discover1',
    playCount: '128万'
  },
  {
    id: 2,
    name: '欧美金曲',
    description: '经典欧美流行音乐',
    cover: 'https://picsum.photos/200/200?random=discover2',
    playCount: '89万'
  },
  {
    id: 3,
    name: '民谣精选',
    description: '温暖的民谣时光',
    cover: 'https://picsum.photos/200/200?random=discover3',
    playCount: '56万'
  },
  {
    id: 4,
    name: '电子音乐',
    description: '动感电子节拍',
    cover: 'https://picsum.photos/200/200?random=discover4',
    playCount: '73万'
  }
])

const newSongs = ref([
  {
    id: 1,
    title: '新歌发布',
    artist: '知名歌手',
    cover: 'https://picsum.photos/150/150?random=newsong1',
    duration: '3:45'
  },
  {
    id: 2,
    title: '最新单曲',
    artist: '流行天后',
    cover: 'https://picsum.photos/150/150?random=newsong2',
    duration: '4:12'
  },
  {
    id: 3,
    title: '首发歌曲',
    artist: '独立音乐人',
    cover: 'https://picsum.photos/150/150?random=newsong3',
    duration: '3:28'
  }
])

const popularArtists = ref([
  {
    id: 1,
    name: '周杰伦',
    avatar: 'https://picsum.photos/100/100?random=artist1',
    songCount: 156
  },
  {
    id: 2,
    name: '邓紫棋',
    avatar: 'https://picsum.photos/100/100?random=artist2',
    songCount: 89
  },
  {
    id: 3,
    name: '林俊杰',
    avatar: 'https://picsum.photos/100/100?random=artist3',
    songCount: 123
  },
  {
    id: 4,
    name: '陈奕迅',
    avatar: 'https://picsum.photos/100/100?random=artist4',
    songCount: 201
  }
])

// 方法
const openPlaylist = (playlist) => {
  console.log('打开歌单:', playlist.name)
}

const playSong = (song) => {
  console.log('播放歌曲:', song.title)
}

const openArtist = (artist) => {
  console.log('打开歌手页面:', artist.name)
}

// 生命周期
onMounted(() => {
  console.log('发现页面加载完成')
})
</script>

<style scoped>
/* 页面整体样式 */
.discover-page {
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

/* 轮播图样式 */
.banner-carousel {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
  padding-bottom: var(--spacing-md);
  margin-bottom: var(--spacing-xxl);
}

.banner-item {
  flex: 0 0 400px;
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
}

.banner-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: var(--spacing-lg);
  color: var(--color-text-inverse);
}

.banner-overlay h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
}

/* 歌单网格 */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xxl);
}

.playlist-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
  box-shadow: var(--shadow-sm);
}

.playlist-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.playlist-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
}

.playlist-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal) var(--ease-out);
}

.playlist-card:hover .playlist-cover img {
  transform: scale(1.05);
}

.play-count {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.5);
  color: var(--color-text-inverse);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.playlist-info {
  padding: var(--spacing-md);
}

.playlist-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 新歌网格 */
.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xxl);
}

.song-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
  box-shadow: var(--shadow-sm);
}

.song-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.song-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
}

.song-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.song-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  color: var(--color-text-inverse);
  font-size: var(--font-size-lg);
  background: var(--color-primary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.song-info {
  padding: var(--spacing-md);
}

.song-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 歌手网格 */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-lg);
}

.artist-card {
  text-align: center;
  cursor: pointer;
  transition: transform var(--transition-fast) var(--ease-out);
}

.artist-card:hover {
  transform: translateY(-2px);
}

.artist-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto var(--spacing-md);
  border: 2px solid var(--color-border);
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.artist-songs {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-carousel {
    gap: var(--spacing-sm);
  }
  
  .banner-item {
    flex: 0 0 300px;
  }
  
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--spacing-md);
  }
  
  .songs-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--spacing-md);
  }
  
  .artists-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--spacing-md);
  }
}
</style>