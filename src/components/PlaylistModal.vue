<template>
  <Transition name="fade-in">
    <div v-if="showPlaylistModal" class="playlist-modal-overlay" @click="hidePlaylistModal">
      <div class="playlist-modal-content" @click.stop>
        <!-- 头部 -->
        <div class="playlist-modal-header">
          <h3 class="playlist-modal-title">播放列表 ({{ playlist.length }})</h3>
          <button class="close-btn" @click="hidePlaylistModal">
            <el-icon><Close /></el-icon>
          </button>
        </div>
        
        <!-- 播放列表内容 -->
        <div class="playlist-modal-body">
          <div
            v-for="(song, index) in playlist"
            :key="song.id"
            class="playlist-modal-item"
            :class="{ 
              active: index === currentIndex,
              playing: index === currentIndex && isPlaying 
            }"
            @click="playSongFromList(song, index)"
          >
            <div class="item-index" :class="{ 'top-three': index < 3 }">
              <el-icon v-if="index === currentIndex && isPlaying" class="playing-icon">
                <VideoPlay />
              </el-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            
            <div class="item-cover">
              <img :src="song.cover || defaultCover" :alt="song.title || song.name" />
              <div class="playing-indicator" v-if="index === currentIndex && isPlaying">
                <span></span><span></span><span></span>
              </div>
            </div>
            
            <div class="item-info">
              <p class="item-song-name" :class="{ 'text-primary': index === currentIndex }">
                {{ song.title || song.name }}
              </p>
              <p class="item-artist-name">{{ song.artist }}</p>
            </div>
            
            <div class="item-duration">
              <span class="duration-text">{{ formatDuration(song.duration) }}</span>
              <el-icon v-if="index === currentIndex" class="playing-icon-end"><Headset /></el-icon>
            </div>
          </div>
          
          <!-- 空列表 -->
          <div v-if="playlist.length === 0" class="empty-playlist">
            <el-icon class="empty-icon"><List /></el-icon>
            <p>暂无播放列表</p>
            <button class="add-songs-btn" @click="goToHome">去添加歌曲</button>
          </div>
        </div>
        
        <!-- 底部操作栏 -->
        <div class="playlist-modal-footer" v-if="playlist.length > 0">
          <button class="footer-btn" @click="clearPlaylist" title="清空播放列表">
            <el-icon><Delete /></el-icon>
            <span>清空列表</span>
          </button>
          <button class="footer-btn" @click="togglePlayMode" :title="playModeTitle">
            <el-icon>
              <RefreshRight v-if="playMode === 'single'" />
              <Sort v-else-if="playMode === 'random'" />
              <List v-else />
            </el-icon>
            <span>{{ playModeTitle }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '../stores/player.js'
import { useRouter } from 'vue-router'
import {
  Close,
  VideoPlay,
  Headset,
  List,
  Delete,
  RefreshRight,
  Sort
} from '@element-plus/icons-vue'

const router = useRouter()
const playerStore = usePlayerStore()

// 从store中解构响应式状态
const {
  playlist,
  currentIndex,
  isPlaying,
  showPlaylistModal,
  playMode,
  playModeTitle
} = storeToRefs(playerStore)

// 从store中解构方法
const {
  playSong,
  loadSong,
  hidePlaylistModal,
  clearPlaylist,
  togglePlayMode,
  formatTime
} = playerStore

// 默认封面
const defaultCover = 'https://picsum.photos/100/100?default=fallback'

// 播放列表中的歌曲
const playSongFromList = async (song, index) => {
  // 重新加载歌曲以确保状态同步
  await loadSong(index)
  
  // 开始播放
  await play()
  
  hidePlaylistModal()
}

// 格式化时长（兼容不同格式）
const formatDuration = (duration) => {
  if (!duration) return '00:00'
  
  // 如果是毫秒
  if (duration >= 1000) {
    const minutes = Math.floor(duration / 1000 / 60)
    const seconds = Math.floor((duration / 1000) % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  // 如果是秒
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 跳转到首页
const goToHome = () => {
  hidePlaylistModal()
  router.push('/')
}
</script>

<style scoped>
/* 淡入动画 */
.fade-in-enter-active,
.fade-in-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
}

/* 弹窗遮罩 */
.playlist-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 弹窗内容 */
.playlist-modal-content {
  background: var(--color-bg-primary);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 头部 */
.playlist-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.playlist-modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
}

.close-btn:hover {
  background: rgba(var(--color-text-primary-rgb), 0.1);
  color: var(--color-text-primary);
}

.close-btn .el-icon {
  font-size: 20px;
}

/* 列表内容 */
.playlist-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.playlist-modal-body::-webkit-scrollbar {
  width: 6px;
}

.playlist-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.playlist-modal-body::-webkit-scrollbar-thumb {
  background: rgba(var(--color-text-secondary-rgb), 0.2);
  border-radius: 3px;
}

.playlist-modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--color-text-secondary-rgb), 0.4);
}

/* 列表项 */
.playlist-modal-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  margin-bottom: var(--spacing-xs);
}

.playlist-modal-item:hover {
  background: var(--color-bg-secondary);
}

.playlist-modal-item.active {
  background: var(--color-primary-light);
}

.playlist-modal-item.active.text-primary .item-song-name {
  color: var(--color-primary);
}

.playlist-modal-item.playing {
  background: linear-gradient(135deg, var(--color-primary-light), rgba(var(--color-primary-rgb), 0.1));
}

.item-index {
  width: 32px;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.item-index.top-three {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.playing-icon {
  color: var(--color-primary);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.item-cover {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  background: var(--color-bg-secondary);
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playing-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  display: flex;
  gap: 2px;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 4px;
  border-radius: 2px;
}

.playing-indicator span {
  width: 2px;
  background: var(--color-primary);
  animation: sound-bar 0.5s ease-in-out infinite;
}

.playing-indicator span:nth-child(1) {
  height: 6px;
  animation-delay: 0s;
}

.playing-indicator span:nth-child(2) {
  height: 10px;
  animation-delay: 0.1s;
}

.playing-indicator span:nth-child(3) {
  height: 8px;
  animation-delay: 0.2s;
}

@keyframes sound-bar {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.5);
  }
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.item-song-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-artist-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-duration {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.duration-text {
  font-family: var(--font-family-mono);
}

.playing-icon-end {
  color: var(--color-primary);
}

/* 空列表状态 */
.empty-playlist {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxxl);
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--color-text-placeholder);
  margin-bottom: var(--spacing-lg);
}

.empty-playlist p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.add-songs-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast) var(--ease-out);
}

.add-songs-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 底部操作栏 */
.playlist-modal-footer {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.footer-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast) var(--ease-out);
}

.footer-btn:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.footer-btn .el-icon {
  font-size: 16px;
}

/* 深色主题适配 */
.music-player.dark .playlist-modal-content {
  background: var(--color-bg-primary-dark);
}

.music-player.dark .playlist-modal-header {
  background: var(--color-bg-secondary-dark);
  border-color: var(--color-border-dark);
}

.music-player.dark .playlist-modal-item:hover {
  background: var(--color-bg-secondary-dark);
}
</style>