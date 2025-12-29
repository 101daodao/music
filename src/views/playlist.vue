<template>
  <div class="playlist-page" v-loading="loading">
    <!-- 歌单头部信息 -->
    <div class="playlist-header" v-if="playlist">
      <div class="playlist-cover">
        <img :src="playlist.coverImgUrl" :alt="playlist.name" />
      </div>
      <div class="playlist-info">
        <h1 class="playlist-name">{{ playlist.name }}</h1>
        <div class="playlist-meta">
          <span class="meta-item">
            <el-icon :size="14"><Folder /></el-icon>
            {{ playlist.trackCount }} 首歌曲
          </span>
          <span class="meta-item">
            <el-icon :size="14"><Headset /></el-icon>
            {{ formatPlayCount(playlist.playCount) }} 播放
          </span>
          <span class="meta-item">
            <el-icon :size="14"><User /></el-icon>
            {{ playlist.creator }}
          </span>
        </div>
        <p class="playlist-desc" v-if="playlist.description">{{ playlist.description }}</p>
        <div class="playlist-actions">
          <el-button type="primary" @click="playAll">
            <el-icon><VideoPlay /></el-icon> 播放全部
          </el-button>
          <el-button @click="likePlaylist">
            <el-icon><Star /></el-icon> 收藏
          </el-button>
        </div>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div class="songs-list" v-if="playlist">
      <div class="list-header">
        <h3 class="list-title">歌曲列表</h3>
        <span class="list-count">{{ playlist.songs.length }} 首歌曲</span>
      </div>
      <div class="songs-container">
        <div
          v-for="(song, index) in playlist.songs"
          :key="song.id"
          class="song-item"
          @click="playSong(index)"
          :class="{ 'is-playing': currentSong?.id === song.id }"
        >
          <span class="song-index" :class="{ 'top-three': index < 3 }">
            <el-icon v-if="isPlaying && currentSong?.id === song.id" class="playing-icon">
              <Loading />
            </el-icon>
            <span v-else>{{ index + 1 }}</span>
          </span>
          <div class="song-cover">
            <img :src="song.coverUrl" :alt="song.name" />
          </div>
          <div class="song-details">
            <h4 class="song-title">{{ song.name }}</h4>
            <p class="song-artist">{{ song.artist }}</p>
          </div>
          <div class="song-album">{{ song.album }}</div>
          <div class="song-duration">{{ formatDuration(song.duration) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player.js'
import { musicService, formatPlayCount } from '../api/music.js'
import { ElMessage } from 'element-plus'
import { Folder, Headset, User, VideoPlay, Star, Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const loading = ref(true)
const playlist = ref(null)

// 获取当前播放歌曲
const currentSong = computed(() => playerStore.currentSong)
const isPlaying = computed(() => playerStore.isPlaying)

// 加载歌单详情
const loadPlaylist = async () => {
  loading.value = true
  const id = route.params.id
  
  if (!id) {
    ElMessage.error('歌单ID不存在')
    router.push('/rank')
    return
  }

  const result = await musicService.getPlaylistDetail(id)
  
  if (result.success) {
    playlist.value = result.data
  } else {
    ElMessage.error('加载歌单失败：' + result.error)
    router.push('/rank')
  }
  
  loading.value = false
}

// 格式化时长
const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 1000 / 60)
  const seconds = Math.floor((ms / 1000) % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 播放歌曲
const playSong = async (index) => {
  if (!playlist.value || !playlist.value.songs.length) return
  
  const songs = playlist.value.songs.map((song, idx) => ({
    id: song.id,
    title: song.name || song.title || '未知歌曲',
    artist: song.artist,
    album: song.album,
    cover: song.coverUrl || song.cover,
    duration: song.duration
  }))
  
  // 使用 store 的方法更新播放列表
  playerStore.setPlaylist(songs)
  
  // 播放指定索引的歌曲
  await playerStore.loadSong(index)
  await playerStore.play()
}

// 播放全部
const playAll = async () => {
  if (!playlist.value || !playlist.value.songs.length) {
    ElMessage.warning('歌单中没有歌曲')
    return
  }
  await playSong(0)
}

// 收藏歌单
const likePlaylist = () => {
  ElMessage.success('收藏成功')
}

onMounted(() => {
  loadPlaylist()
})
</script>

<style scoped>
.playlist-page {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
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

/* 歌单头部 */
.playlist-header {
  display: flex;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
}

.playlist-cover {
  width: 200px;
  height: 200px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.playlist-name {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.4;
}

.playlist-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.playlist-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
  flex: 1;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.playlist-actions {
  display: flex;
  gap: var(--spacing-md);
}

/* 歌曲列表 */
.songs-list {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.list-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.list-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.songs-container {
  display: flex;
  flex-direction: column;
}

.song-item {
  display: grid;
  grid-template-columns: 60px 60px 1fr 200px 80px;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast) var(--ease-out);
  cursor: pointer;
  gap: var(--spacing-md);
}

.song-item:hover {
  background: var(--color-bg-tertiary);
}

.song-item.is-playing {
  background: var(--color-primary-light, rgba(64, 158, 255, 0.1));
}

.song-index {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  text-align: center;
  min-width: 30px;
}

.song-index.top-three {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.playing-icon {
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

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-details {
  min-width: 0;
}

.song-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-album {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-duration {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playlist-page {
    padding: var(--spacing-md);
  }

  .playlist-header {
    flex-direction: column;
  }

  .playlist-cover {
    width: 100%;
    height: 0;
    padding-bottom: 100%;
  }

  .song-item {
    grid-template-columns: 40px 40px 1fr;
    gap: var(--spacing-sm);
  }

  .song-album,
  .song-duration {
    display: none;
  }
}
</style>