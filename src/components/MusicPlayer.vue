<template>
  <div class="music-player" :class="currentTheme">
    <!-- 播放器主体 -->
    <div class="player-main" @click="toggleLyricsModal">
      <!-- 歌曲信息和封面 -->
      <div class="track-info" @click.stop>
        <div class="album-cover" :class="{ rotating: isPlaying }">
          <img :src="currentSong?.cover || defaultCover" :alt="currentSong?.title" />
          <div class="play-overlay">
            <el-icon><VideoPlay v-if="!isPlaying" /><VideoPause v-else /></el-icon>
          </div>
        </div>
        <div class="track-details">
          <h4 class="track-title">{{ currentSong?.title || '暂无播放' }}</h4>
          <p class="track-artist">{{ currentSong?.artist || '未知歌手' }}</p>
        </div>
      </div>
      
      <!-- 播放控制 -->
      <div class="player-controls-left">
        <!-- 上一首 -->
        <button class="control-btn" @click.stop="prevSong" :disabled="!canPrev">
          <el-icon><DArrowLeft /></el-icon>
        </button>
        
        <!-- 播放/暂停 -->
        <button class="play-pause-btn" @click.stop="togglePlay">
          <el-icon><VideoPause v-if="isPlaying" /><VideoPlay v-else /></el-icon>
        </button>
        
        <!-- 下一首 -->
        <button class="control-btn" @click.stop="nextSong" :disabled="!canNext">
          <el-icon><DArrowRight /></el-icon>
        </button>
      </div>
      
      <!-- 右侧控制 -->
      <div class="player-controls-right">
        <!-- 播放模式 -->
        <button class="control-btn mode-btn" @click.stop="togglePlayMode" :title="playModeTitle">
          <el-icon>
            <RefreshRight v-if="playMode === 'single'" />
            <Sort v-else-if="playMode === 'random'" />
            <List v-else />
          </el-icon>
        </button>
        
        <!-- 歌单列表 -->
        <button class="control-btn" @click.stop="togglePlaylistModal" title="歌单列表">
          <el-icon><Service /></el-icon>
        </button>
        
        <!-- 音量控制 -->
        <div class="volume-control">
          <button class="control-btn" @click.stop="toggleMute">
            <el-icon>
              <MuteNotification v-if="isMuted || volume === 0" />
              <Bell v-else />
            </el-icon>
          </button>
          <div class="volume-slider-container">
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
      </div>
      
      <!-- 进度条 -->
      <div class="progress-section">
        <span class="time-text">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click.stop="seekTo">
          <div class="progress-buffer" :style="{ width: bufferProgress + '%' }"></div>
          <div class="progress-current" :style="{ width: progressPercentage + '%' }"></div>
          <div class="progress-thumb" :style="{ left: progressPercentage + '%' }"></div>
        </div>
        <span class="time-text">{{ formatTime(duration) }}</span>
      </div>
    </div>
    
    <!-- 歌词弹窗 -->
    <Teleport to="body">
      <LyricsModal />
    </Teleport>
    
    <!-- 播放列表弹窗 -->
    <Teleport to="body">
      <PlaylistModal />
    </Teleport>
    
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
import LyricsModal from './LyricsModal.vue'
import PlaylistModal from './PlaylistModal.vue'
import {
  VideoPlay,
  VideoPause,
  DArrowLeft,
  DArrowRight,
  RefreshRight,
  Sort,
  List,
  Bell,
  MuteNotification,
  Service
} from '@element-plus/icons-vue'

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
  showLyricsModal,
  showPlaylistModal,
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
  toggleLyricsModal,
  hideLyricsModal,
  togglePlaylistModal,
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  z-index: var(--z-index-player);
  transition: all var(--transition-normal) var(--ease-out);
}

/* 深色主题适配 */
.music-player.theme-dark {
  background: rgba(24, 24, 28, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 播放器主体 */
.player-main {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  height: 72px;
  gap: var(--spacing-lg);
  cursor: pointer;
  position: relative;
}

.player-main:hover {
  background: rgba(var(--color-primary-rgb), 0.02);
}

/* 歌曲信息 */
.track-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 0 0 300px;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.track-info:hover {
  opacity: 0.8;
}

.album-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background: var(--color-bg-tertiary);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal) var(--ease-out);
}

.album-cover.rotating img {
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast) var(--ease-out);
}

.track-info:hover .play-overlay {
  opacity: 1;
}

.play-overlay .el-icon {
  font-size: 20px;
  color: white;
}

.track-details {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-fast) var(--ease-out);
}

.track-artist {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-info:hover .track-title {
  color: var(--color-primary);
}

/* 播放控制 - 左侧（播放按钮） */
.player-controls-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  justify-content: center;
}

/* 播放控制 - 右侧（其他按钮） */
.player-controls-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-right: var(--spacing-lg);
}

/* 普通控制按钮 */
.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all var(--transition-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 36px;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.control-btn .el-icon {
  font-size: 20px;
  transition: all var(--transition-fast) var(--ease-out);
  position: relative;
  z-index: 1;
}

/* 按钮悬停效果 */
.control-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.15);
  border-color: rgba(var(--color-primary-rgb), 0.4);
  color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
}

.control-btn:hover .el-icon {
  transform: scale(1.15);
}

/* 按钮按下效果 */
.control-btn:active {
  transform: translateY(0) scale(0.95);
  box-shadow: 0 2px 6px rgba(var(--color-primary-rgb), 0.15);
}

.control-btn:active .el-icon {
  transform: scale(1.05);
}

/* 禁用状态 */
.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.control-btn:disabled:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--color-text-secondary);
  box-shadow: none;
}

.control-btn:disabled:hover .el-icon {
  transform: scale(1);
}

/* 播放/暂停按钮 */
.play-pause-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
  box-shadow: 0 4px 15px rgba(var(--color-primary-rgb), 0.4);
  border: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.play-pause-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity var(--transition-fast) var(--ease-out);
}

.play-pause-btn .el-icon {
  font-size: 22px;
  transition: all var(--transition-fast) var(--ease-out);
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.play-pause-btn:hover {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.5);
  border-color: rgba(255, 255, 255, 0.4);
}

.play-pause-btn:hover::after {
  opacity: 1;
}

.play-pause-btn:hover .el-icon {
  transform: scale(1.2);
}

.play-pause-btn:active {
  transform: scale(1.05);
  box-shadow: 0 3px 12px rgba(var(--color-primary-rgb), 0.4);
}

.play-pause-btn:active .el-icon {
  transform: scale(1.1);
}

/* 模式按钮 */
.mode-btn {
  position: relative;
}

.mode-btn.active::after {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
}

/* ========== 深色主题适配 ========== */
.music-player.theme-dark .control-btn {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: var(--color-text-secondary);
}

.music-player.theme-dark .control-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.2);
  border-color: rgba(var(--color-primary-rgb), 0.5);
  color: var(--color-primary-light);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
}

.music-player.theme-dark .play-pause-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, #a80808 100%);
  border-color: rgba(255, 255, 255, 0.15);
}

.music-player.theme-dark .play-pause-btn:hover {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 20px rgba(var(--color-primary-rgb), 0.6);
}

.music-player.theme-dark .mode-btn.active::after {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
}

.mode-btn {
  font-size: 16px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  position: relative;
}

.volume-slider-container {
  position: relative;
  width: 0;
  overflow: hidden;
  transition: width var(--transition-fast) var(--ease-out);
}

.volume-control:hover .volume-slider-container {
  width: 80px;
}

.volume-slider {
  width: 80px;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-round);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(var(--color-primary-rgb), 0.3);
  transition: all var(--transition-fast) var(--ease-out);
  border: 2px solid white;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 10px rgba(var(--color-primary-rgb), 0.5);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
}

.volume-slider::-webkit-slider-thumb:active {
  transform: scale(0.95);
  box-shadow: 0 1px 3px rgba(var(--color-primary-rgb), 0.3);
}

/* 进度条 */
.progress-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 0 0 400px;
}

.time-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  min-width: 40px;
  font-weight: var(--font-weight-medium);
}

.progress-bar {
  flex: 1;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-round);
  position: relative;
  cursor: pointer;
  transition: height var(--transition-fast) var(--ease-out);
}

.progress-bar:hover {
  height: 4px;
}

.progress-buffer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(0, 0, 0, 0.05);
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
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-fast) var(--ease-out);
  box-shadow: 0 2px 6px rgba(var(--color-primary-rgb), 0.3);
  border: 2px solid white;
  z-index: 2;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.05);
}

.progress-thumb:hover {
  transform: translate(-50%, -50%) scale(1.15);
  box-shadow: 0 3px 12px rgba(var(--color-primary-rgb), 0.5);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
}

.progress-thumb:active {
  transform: translate(-50%, -50%) scale(0.95);
  box-shadow: 0 1px 4px rgba(var(--color-primary-rgb), 0.3);
}

/* 深色主题适配 */
.music-player.theme-dark .volume-slider {
  background: rgba(255, 255, 255, 0.1);
}

.music-player.theme-dark .progress-bar {
  background: rgba(255, 255, 255, 0.1);
}

.music-player.theme-dark .progress-buffer {
  background: rgba(255, 255, 255, 0.05);
}

.music-player.theme-dark .progress-thumb {
  border-color: rgba(255, 255, 255, 0.3);
}


/* 响应式设计 */
@media (max-width: 768px) {
  .player-main {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .track-info {
    flex: 0 0 200px;
  }
  
  .progress-section {
    flex: 0 0 250px;
  }
  
  .volume-control:hover .volume-slider-container {
    width: 60px;
  }
  
  .volume-slider {
    width: 60px;
  }
}

@media (max-width: 480px) {
  .player-controls {
    gap: var(--spacing-xs);
  }
  
  .control-btn {
    padding: var(--spacing-xs);
  }
  
  .play-pause-btn {
    width: 32px;
    height: 32px;
  }
  
  .play-pause-btn .el-icon {
    font-size: 16px;
  }
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