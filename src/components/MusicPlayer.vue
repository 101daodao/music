<template>
  <div class="music-player" :class="[currentTheme, { expanded: isExpanded }]">
    <!-- 播放器主体 -->
    <div class="player-main">
      <!-- 歌曲信息 -->
      <div class="track-info">
        <div class="album-cover" :class="{ rotating: isPlaying }" @click="toggleExpanded">
          <img :src="currentSong?.cover || defaultCover" :alt="currentSong?.title" />
          <div class="play-overlay">
            <span class="play-icon">{{ isPlaying ? '⏸' : '▶' }}</span>
          </div>
        </div>
        <div class="track-details">
          <h4 class="track-title">{{ currentSong?.title || '暂无播放' }}</h4>
          <p class="track-artist">{{ currentSong?.artist || '未知歌手' }}</p>
        </div>
      </div>
      
      <!-- 播放控制 -->
      <div class="player-controls">
        <!-- 播放模式 -->
        <button class="control-btn" @click="togglePlayMode" :title="playModeTitle">
          <span>{{ playModeIcon }}</span>
        </button>
        
        <!-- 上一首 -->
        <button class="control-btn" @click="prevSong" :disabled="!canPrev">
          <span>⏮</span>
        </button>
        
        <!-- 播放/暂停 -->
        <button class="play-pause-btn" @click="togglePlay">
          <span>{{ isPlaying ? '⏸' : '▶' }}</span>
        </button>
        
        <!-- 下一首 -->
        <button class="control-btn" @click="nextSong" :disabled="!canNext">
          <span>⏭</span>
        </button>
        
        <!-- 音量 -->
        <div class="volume-control">
          <button class="control-btn" @click="toggleMute">
            <span>{{ volumeIcon }}</span>
          </button>
          <input 
            type="range" 
            class="volume-slider"
            v-model="volume"
            min="0" 
            max="100"
            @input="updateVolume"
          />
        </div>
      </div>
      
      <!-- 进度条 -->
      <div class="progress-section">
        <span class="time-text">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="seekTo">
          <div class="progress-buffer" :style="{ width: bufferProgress + '%' }"></div>
          <div class="progress-current" :style="{ width: progressPercentage + '%' }"></div>
          <div class="progress-thumb" :style="{ left: progressPercentage + '%' }"></div>
        </div>
        <span class="time-text">{{ formatTime(duration) }}</span>
      </div>
    </div>
    
    <!-- 展开的播放器（包含歌词） -->
    <div class="player-expanded" v-if="isExpanded">
      <div class="expanded-header">
        <button class="collapse-btn" @click="isExpanded = false">✕</button>
      </div>
      <div class="expanded-content">
        <!-- 专辑封面大图 -->
        <div class="large-cover">
          <img :src="currentSong?.cover || defaultCover" :alt="currentSong?.title" 
               :class="{ rotating: isPlaying }" />
        </div>
        
        <!-- 歌曲详细信息 -->
        <div class="song-info">
          <h2 class="song-title">{{ currentSong?.title || '暂无播放' }}</h2>
          <p class="song-artist">{{ currentSong?.artist || '未知歌手' }}</p>
          <p class="song-album">{{ currentSong?.album || '未知专辑' }}</p>
        </div>
        
        <!-- 歌词显示 -->
        <div class="lyrics-container" ref="lyricsContainer">
          <div class="lyrics-content" :style="{ transform: `translateY(${lyricsOffset}px)` }">
            <div 
              v-for="(line, index) in currentLyrics" 
              :key="index"
              class="lyric-line"
              :class="{ active: index === currentLyricIndex }"
              @click="seekToLyric(line.time)"
            >
              {{ line.text }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 音频元素 -->
    <audio 
      ref="audioPlayer"
      @timeupdate="playerStore.onTimeUpdate"
      @loadedmetadata="playerStore.onLoadedMetadata"
      @ended="playerStore.onSongEnd"
      @progress="playerStore.onProgress"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '../stores/player.js'
import { useThemeStore } from '../stores/theme.js'

const playerStore = usePlayerStore()
const themeStore = useThemeStore()

// DOM 引用
const audioPlayer = ref(null)
const lyricsContainer = ref(null)

// 默认封面
const defaultCover = 'https://picsum.photos/200/200?default=fallback'

// 从store中解构响应式状态，保持响应性
const {
  currentSong,
  isPlaying,
  isExpanded,
  currentTime,
  duration,
  volume,
  isMuted,
  bufferProgress,
  playlist,
  currentIndex,
  playMode,
  currentLyrics,
  currentLyricIndex,
  lyricsOffset,
  progressPercentage,
  playModeIcon,
  playModeTitle,
  volumeIcon,
  canPrev,
  canNext
} = storeToRefs(playerStore)

// 从store中解构方法（方法不需要storeToRefs）
const {
  initAudio,
  togglePlay,
  play,
  pause,
  prevSong,
  nextSong,
  togglePlayMode,
  toggleMute,
  updateVolume,
  seekTo,
  seekToLyric,
  loadSong,
  playSong,
  setPlaylist,
  clearPlaylist,
  loadLyrics,
  updateCurrentLyric,
  formatTime,
  searchSongs,
  onTimeUpdate,
  onLoadedMetadata,
  onSongEnd,
  onProgress
} = playerStore

// 从主题store中解构，保持响应性
const { currentTheme } = storeToRefs(themeStore)

// 监听主题变化，确保组件响应主题切换
watch(() => themeStore.currentTheme, (newTheme) => {
  console.log('播放器主题已切换到:', newTheme)
})

// 展开收起播放器
const toggleExpanded = () => {
  playerStore.isExpanded = !playerStore.isExpanded
}

// 初始化音乐数据
const initializeData = async () => {
  try {
    // 使用store中的searchSongs方法获取示例数据
    const result = await searchSongs('周杰伦', 10)
    
    if (result.success && result.data.length > 0) {
      // 将搜索结果转换为播放列表格式
      const songs = result.data.map(item => ({
        id: item.id,
        title: item.name || '未知歌曲',
        artist: item.artist || '未知歌手',
        album: item.album || '未知专辑',
        cover: item.coverUrl || defaultCover,
        duration: item.duration || 0,
        url: '' // url将在播放时动态获取
      }))
      
      setPlaylist(songs)
      console.log('音乐数据加载完成:', songs.length, '首歌曲')
    } else {
      console.warn('搜索音乐结果为空')
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
}

// 响应式监听volume变化
watch(volume, (newVolume) => {
  updateVolume()
})

// 生命周期
onMounted(() => {
  // 初始化音频元素
  if (audioPlayer.value) {
    initAudio(audioPlayer.value)
  }
  
  // 初始化数据
  initializeData()
})

onUnmounted(() => {
  // 清理音频播放器
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
})

// 暴露方法给父组件
defineExpose({
  playSong,
  searchSongs,
  togglePlay
})
</script>

<style scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: var(--z-index-player);
  transition: all var(--transition-normal) var(--ease-out);
}

.music-player.expanded {
  top: 0;
  background: var(--color-bg-primary);
}

/* 播放器主体 */
.player-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  height: 80px;
}

/* 歌曲信息 */
.track-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.album-cover {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-cover.rotating img {
  animation: rotate 20s linear infinite;
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

.album-cover:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  color: var(--color-text-inverse);
  font-size: var(--font-size-lg);
}

.track-details {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 播放控制 */
.player-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.control-btn {
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast) var(--ease-out);
}

.control-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-primary);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-pause-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xl);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
}

.play-pause-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.1);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-border);
  border-radius: var(--radius-round);
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
}

/* 进度条 */
.progress-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  max-width: 300px;
}

.time-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  min-width: 40px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-round);
  position: relative;
  cursor: pointer;
}

.progress-buffer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-round);
  transition: width var(--transition-fast) var(--ease-out);
}

.progress-current {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-round);
  transition: width var(--transition-fast) var(--ease-out);
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.progress-thumb:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

/* 展开的播放器 */
.player-expanded {
  height: calc(100vh - 80px);
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.expanded-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-lg);
}

.collapse-btn {
  background: var(--color-bg-tertiary);
  border: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.collapse-btn:hover {
  background: var(--color-bg-secondary);
}

.expanded-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.large-cover {
  width: 300px;
  height: 300px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.large-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.large-cover.rotating img {
  animation: rotate 20s linear infinite;
}

.song-info {
  text-align: center;
}

.song-title {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.song-artist {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.song-album {
  font-size: var(--font-size-base);
  color: var(--color-text-tertiary);
}

/* 歌词容器 */
.lyrics-container {
  height: 200px;
  overflow: hidden;
  position: relative;
  text-align: center;
  width: 100%;
  max-width: 600px;
}

.lyrics-content {
  transition: transform var(--transition-normal) var(--ease-out);
  padding: 100px 0;
}

.lyric-line {
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  line-height: var(--line-height-relaxed);
}

.lyric-line:hover {
  color: var(--color-text-primary);
}

.lyric-line.active {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  transform: scale(1.05);
}

/* 旋转动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .player-main {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .track-info {
    flex: 0 0 auto;
  }
  
  .album-cover {
    width: 50px;
    height: 50px;
  }
  
  .track-details {
    display: none;
  }
  
  .progress-section {
    max-width: 200px;
  }
  
  .volume-slider {
    width: 60px;
  }
  
  .large-cover {
    width: 250px;
    height: 250px;
  }
  
  .song-title {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 480px) {
  .control-btn span {
    font-size: var(--font-size-base);
  }
  
  .play-pause-btn {
    width: 35px;
    height: 35px;
    font-size: var(--font-size-lg);
  }
  
  .progress-section {
    flex: 1;
    max-width: none;
  }
  
  .volume-control {
    display: none;
  }
}
</style>