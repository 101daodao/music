<template>
  <div v-if="showLyricsModal" class="fullscreen-lyrics">
      <!-- 顶部栏 -->
      <div class="lyrics-header-bar">
        <button class="close-btn" @click="hideLyricsModal">
          <el-icon><ArrowDown /></el-icon>
        </button>
        <div class="song-info-bar">
          <span class="song-title-bar">{{ currentSong?.title || '暂无播放' }}</span>
          <span class="song-artist-bar">{{ currentSong?.artist || '未知歌手' }}</span>
        </div>
        <button class="tool-btn" @click="togglePlaylist" :title="showPlaylist ? '关闭歌单' : '打开歌单'">
          <el-icon><List /></el-icon>
        </button>
      </div>

      <!-- 主内容区 -->
      <div class="lyrics-main-content">
        <!-- 左侧唱片区 -->
        <div class="vinyl-section">
          <div class="vinyl-container" :class="{ rotating: isPlaying }">
            <!-- 唱片 -->
            <div class="vinyl-disc">
              <div class="vinyl-grooves"></div>
            </div>
            <!-- 封面 -->
            <div class="vinyl-cover">
              <img :src="currentSong?.cover || defaultCover" :alt="currentSong?.title" />
            </div>
            <!-- 唱片中心 -->
          </div>
          
          <!-- 歌曲信息 -->
          <div class="vinyl-info">
            <h2 class="vinyl-title">{{ currentSong?.title || '暂无播放' }}</h2>
            <p class="vinyl-artist">{{ formatArtistName(currentSong?.artist) }}</p>
            <p class="vinyl-album">{{ formatAlbumName(currentSong?.album) }}</p>
          </div>
        </div>
        
        <!-- 右侧歌词区 -->
        <div class="lyrics-container-section">
          <!-- 歌词显示 -->
          <div class="lyrics-scroll" ref="lyricsContainer" :class="{ 'with-playlist': showPlaylist }">
            <div class="lyrics-list">
              <div
                v-for="(line, index) in currentLyrics"
                :key="index"
                class="lyric-item"
                :class="{ active: index === currentLyricIndex }"
                @click="seekToLyric(line.time)"
              >
                <span class="lyric-time">{{ formatTime(line.time) }}</span>
                <p class="lyric-content">{{ line.text }}</p>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-if="currentLyrics.length === 0 || (currentLyrics.length === 1 && currentLyrics[0].text === '暂无歌词')" class="empty-state">
              <el-icon class="empty-icon"><Headset /></el-icon>
              <p>{{ loading ? '正在加载歌词...' : '暂无歌词' }}</p>
            </div>
          </div>
          
          <!-- 播放列表侧边栏 -->
          <Transition name="slide-in-right">
            <div v-if="showPlaylist" class="playlist-sidebar">
              <div class="playlist-header">
                <h3>播放列表 ({{ playlist.length }})</h3>
                <button class="close-playlist" @click="showPlaylist = false">
                  <el-icon><ArrowRight /></el-icon>
                </button>
              </div>
              <div class="playlist-content">
                <div
                  v-for="(song, index) in playlist"
                  :key="song.id"
                  class="playlist-item"
                  :class="{ active: index === currentIndex, playing: index === currentIndex && isPlaying }"
                  @click="playSongFromList(song, index)"
                >
                  <div class="playlist-item-cover">
                    <img :src="song.cover || defaultCover" :alt="song.title" />
                    <div class="playing-indicator" v-if="index === currentIndex && isPlaying">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                  <div class="playlist-item-info">
                    <p class="song-name" :class="{ 'text-primary': index === currentIndex }">{{ song.title }}</p>
                    <p class="artist-name">{{ song.artist }}</p>
                  </div>
                  <div class="playlist-item-action">
                    <el-icon v-if="index === currentIndex"><Headset /></el-icon>
                  </div>
                </div>
                
                <!-- 空列表 -->
                <div v-if="playlist.length === 0" class="empty-playlist">
                  <el-icon class="empty-icon"><List /></el-icon>
                  <p>暂无播放列表</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
      
      <!-- 字体大小调整器 -->
      <div class="font-adjuster" v-if="showFontAdjuster">
        <button class="adjust-btn" @click="decreaseFontSize" :disabled="fontSize <= 14">
          <el-icon><ArrowLeft /></el-icon>
        </button>
        <span class="font-size">{{ fontSize }}px</span>
        <button class="adjust-btn" @click="increaseFontSize" :disabled="fontSize >= 24">
          <el-icon><ArrowRight /></el-icon>
        </button>
      </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '../stores/player.js'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Edit,
  Headset,
  List
} from '@element-plus/icons-vue'

// Store
const playerStore = usePlayerStore()

// 响应式数据
const {
  currentSong,
  isPlaying,
  currentLyrics,
  currentLyricIndex,
  playlist,
  currentIndex,
  showLyricsModal
} = storeToRefs(playerStore)

const {
  seekToLyric,
  playSong,
  loadSong,
  hideLyricsModal,
  formatTime
} = playerStore

// 本地状态
const defaultCover = 'https://picsum.photos/300/300?default=fallback'
const lyricsContainer = ref(null)
const showFontAdjuster = ref(false)
const showPlaylist = ref(false)
const fontSize = ref(16)
const loading = ref(false)

// 格式化艺术家名称（处理空值或对象类型）
const formatArtistName = (artist) => {
  if (!artist) return '未知歌手'
  
  // 如果是对象且name为空，返回未知歌手
  if (typeof artist === 'object' && artist.name === '') {
    return '群星/合集'
  }
  
  // 如果是对象，返回name属性
  if (typeof artist === 'object' && artist.name) {
    return artist.name
  }
  
  // 如果是字符串，直接返回
  if (typeof artist === 'string') {
    return artist || '未知歌手'
  }
  
  return '未知歌手'
}

// 格式化专辑名称（处理特殊类型专辑）
const formatAlbumName = (album) => {
  if (!album) return '未知专辑'
  
  // 如果是对象
  if (typeof album === 'object' && album.name) {
    return album.name
  }
  
  // 如果是字符串
  if (typeof album === 'string') {
    return album || '未知专辑'
  }
  
  return '未知专辑'
}

// 方法

// 监听 showLyricsModal 变化
watch(() => showLyricsModal.value, (newVal) => {
  if (newVal) {
    nextTick(() => {
      scrollToCurrentLyric()
    })
  }
})

const adjustFontSize = () => {
  showFontAdjuster.value = !showFontAdjuster.value
}

const togglePlaylist = () => {
  showPlaylist.value = !showPlaylist.value
}

const playSongFromList = async (song, index) => {
  if (currentIndex.value !== index) {
    updateCurrentLyricIndex()
    await playSong(song.id)
    // 更新当前歌曲信息
    currentSong.value = song
  }
}

// 辅助方法：更新当前歌词索引
const updateCurrentLyricIndex = () => {
  currentLyricIndex.value = 0
}

const increaseFontSize = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2
  }
}

const decreaseFontSize = () => {
  if (fontSize.value > 14) {
    fontSize.value -= 2
  }
}

// 滚动到当前歌词
const scrollToCurrentLyric = () => {
  if (!lyricsContainer.value) return
  
  const container = lyricsContainer.value
  const activeLine = container.querySelector('.lyric-item.active')
  
  if (activeLine) {
    const containerHeight = container.clientHeight
    const activeLineHeight = activeLine.offsetHeight
    const activeLineTop = activeLine.offsetTop
    const targetScrollTop = activeLineTop - (containerHeight / 2) + (activeLineHeight / 2)
    
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })
  }
}

// 监听当前歌曲变化
watch(() => currentSong.value?.id, (newId) => {
  if (newId && showLyricsModal.value) {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 500)
  }
})


// 监听歌词索引变化，自动滚动
watch(currentLyricIndex, (newIndex) => {
  if (newIndex >= 0 && showLyricsModal.value) {
    nextTick(() => {
      scrollToCurrentLyric()
    })
  }
})
</script>

<style scoped>
/* 全屏歌词容器 */
.fullscreen-lyrics {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: calc(100vh - 72px);
  min-height: calc(100vh - 72px);
  z-index: 99999 !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg-primary);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
}

/* 滑入动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* 顶部栏 */
.lyrics-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(var(--color-bg-primary-rgb), 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
}

.close-btn:hover {
  background: rgba(var(--color-text-primary-rgb), 0.1);
}

.close-btn .el-icon {
  font-size: 24px;
}

.song-info-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.song-title-bar {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.song-artist-bar {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.tool-btn {
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
}

.tool-btn:hover {
  background: rgba(var(--color-text-primary-rgb), 0.1);
}

.tool-btn .el-icon {
  font-size: 20px;
}

/* 主内容区 */
.lyrics-main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 唱片区 */
.vinyl-section {
  flex: 0 0 450px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: var(--spacing-xxxl);
}

.vinyl-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotate 30s linear infinite;
}

/* 唱片容器 */
.vinyl-container {
  width: 250px;
  height: 250px;
  position: relative;
  z-index: 1;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.vinyl-container.rotating {
  animation: vinyl-rotate 20s linear infinite;
}

.vinyl-container.rotating:hover {
  animation-play-state: paused;
}

@keyframes vinyl-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 唱片片 */
.vinyl-disc {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at center, transparent 65px,
    repeating-radial-gradient(circle at center,
      rgba(30, 30, 30, 1) 0px,
      rgba(40, 40, 40, 1) 2px,
      rgba(30, 30, 30, 1) 4px
    ) 65px,
    #111 125px
  );
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.5);
}

/* 唱片纹理 */
.vinyl-grooves {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    transparent 0px,
    transparent 1px,
    rgba(255, 255, 255, 0.02) 1px,
    rgba(255, 255, 255, 0.02) 2px
  );
}

/* 唱片封面 */
.vinyl-cover {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 175px;
  height: 175px;
  border-radius: 50%;
  overflow: hidden;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vinyl-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 唱片中心 */
.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #555, #222);
  z-index: 3;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.vinyl-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: #111;
  border-radius: 50%;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.8);
}

/* 唱片信息 */
.vinyl-info {
  text-align: center;
  margin-top: var(--spacing-xxl);
  z-index: 1;
}

.vinyl-title {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.vinyl-artist {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.vinyl-album {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 歌词容器区 */
.lyrics-container-section {
  flex: 1;
  background: var(--color-bg-primary);
  position: relative;
  overflow: hidden;
}

.lyrics-scroll {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-xl) var(--spacing-xxl);
  scroll-behavior: smooth;
}

.lyrics-scroll::-webkit-scrollbar {
  width: 4px;
}

.lyrics-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.lyrics-scroll::-webkit-scrollbar-thumb {
  background: rgba(var(--color-primary-rgb), 0.3);
  border-radius: var(--radius-round);
  transition: background var(--transition-fast) var(--ease-out);
}

.lyrics-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--color-primary-rgb), 0.5);
}

.lyrics-list {
  max-width: 700px;
  margin: 0 auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.lyrics-list::before,
.lyrics-list::after {
  content: '';
  flex: 1;
  min-height: 30vh;
}

/* 歌词项 */
.lyric-item {
  text-align: center;
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
  position: relative;
  opacity: 0.4;
  transform: scale(0.95);
  font-size: var(--font-size-lg);
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.lyric-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  min-width: 50px;
  opacity: 0.6;
}

.lyric-content {
  flex: 1;
}

.lyric-item:hover {
  opacity: 0.7;
  transform: scale(0.98);
}

.lyric-item:hover .lyric-time {
  opacity: 0.8;
}

.lyric-item.active {
  opacity: 1;
  transform: scale(1);
  color: var(--color-primary);
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  text-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.3);
}

.lyric-item.active .lyric-time {
  color: var(--color-primary);
  opacity: 0.8;
}

.lyric-item.active::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 120%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(var(--color-primary-rgb), 0.05) 30%,
    rgba(var(--color-primary-rgb), 0.05) 70%,
    transparent 100%
  );
  z-index: -1;
  border-radius: var(--radius-lg);
}

.lyric-content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  transition: all var(--transition-normal) var(--ease-out);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
}

.empty-state .empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
  opacity: 0.4;
}

/* 播放列表侧边栏 */
.playlist-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  background: var(--color-bg-primary);
  border-left: 1px solid var(--color-border);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

/* 侧边栏滑入动画 */
.slide-in-right-enter-active,
.slide-in-right-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-in-right-enter-from,
.slide-in-right-leave-to {
  transform: translateX(100%);
}

/* 播放列表头部 */
.playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.playlist-header h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.close-playlist {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
}

.close-playlist:hover {
  background: rgba(var(--color-text-primary-rgb), 0.1);
  color: var(--color-text-primary);
}

/* 播放列表内容区 */
.playlist-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.playlist-content::-webkit-scrollbar {
  width: 4px;
}

.playlist-content::-webkit-scrollbar-track {
  background: transparent;
}

.playlist-content::-webkit-scrollbar-thumb {
  background: rgba(var(--color-primary-rgb), 0.3);
  border-radius: var(--radius-round);
  transition: background var(--transition-fast) var(--ease-out);
}

.playlist-content::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--color-primary-rgb), 0.5);
}

/* 播放列表项 */
.playlist-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  margin-bottom: var(--spacing-xs);
}

.playlist-item:hover {
  background: rgba(var(--color-primary-rgb), 0.05);
}

.playlist-item.active {
  background: rgba(var(--color-primary-rgb), 0.1);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
}

.playlist-item.playing {
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1) 0%, rgba(var(--color-primary-rgb), 0.05) 100%);
  border: 1px solid rgba(var(--color-primary-rgb), 0.3);
}

/* 播放列表封面 */
.playlist-item-cover {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.playlist-item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 播放中指示器 */
.playing-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.playing-indicator span {
  width: 3px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 2px;
  animation: playing-bar 0.8s ease-in-out infinite;
}

.playing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.playing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.playing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes playing-bar {
  0%, 100% {
    height: 6px;
  }
  50% {
    height: 16px;
  }
}

/* 播放列表信息 */
.playlist-item-info {
  flex: 1;
  min-width: 0;
}

.playlist-item-info .song-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-item-info .song-name.text-primary {
  color: var(--color-primary);
}

.playlist-item-info .artist-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

/* 播放列表项操作 */
.playlist-item-action {
  flex-shrink: 0;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 空播放列表 */
.empty-playlist {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  padding: var(--spacing-xxl);
}

.empty-playlist .empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  opacity: 0.4;
}

.empty-playlist p {
  font-size: var(--font-size-sm);
  margin: 0;
}

/* 歌词带播放列表时的样式调整 */
.lyrics-scroll.with-playlist {
  padding-right: var(--spacing-xxl);
}

.text-primary {
  color: var(--color-primary) !important;
}

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

/* 字体调整器 */
.font-adjuster {
  position: absolute;
  left: 50%;
  bottom: var(--spacing-lg);
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-xl);
  background: rgba(var(--color-bg-primary-rgb), 0.95);
  backdrop-filter: blur(20px);
  border-radius: 50px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--color-border);
  z-index: 10;
}

.adjust-btn {
  background: var(--color-bg-secondary);
  border: none;
  color: var(--color-text-primary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
}

.adjust-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.adjust-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.adjust-btn .el-icon {
  font-size: 20px;
}

.font-size {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  min-width: 50px;
  text-align: center;
}
</style>