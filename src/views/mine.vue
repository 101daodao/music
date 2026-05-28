<template>
  <div class="mine-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <h1 class="page-title">
          <el-icon :size="32"><User /></el-icon>
          个人中心
        </h1>
        <p class="page-subtitle">发现优质音乐，享受精彩生活</p>
      </div>
    </div>

    <!-- 未登录状态 -->
    <div v-if="!authStore.isLoggedIn" class="not-logged-in">
      <el-empty description="请先登录">
        <el-button type="primary" @click="showLoginModal = true">
          <el-icon><Key /></el-icon>
          立即登录
        </el-button>
      </el-empty>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="logged-in-container">
      <!-- 用户信息卡片 -->
      <div class="user-info-card">
        <div class="user-avatar-section">
          <div class="user-avatar-wrapper">
            <img :src="authStore.avatar || defaultAvatar" alt="用户头像" class="user-avatar-img" />
            <el-icon class="avatar-bg-icon" :size="120"><Avatar /></el-icon>
          </div>
        </div>
        <div class="user-detail-section">
          <h2 class="user-nickname">{{ authStore.nickname }}</h2>
          <div class="user-meta">
            <span class="meta-item">
              <el-icon><Postcard /></el-icon>
              用户ID：{{ authStore.userId || '未知' }}
            </span>
          </div>
          <div class="user-stats" v-if="userStats">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.follows }}</div>
              <div class="stat-label">关注</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.followeds }}</div>
              <div class="stat-label">粉丝</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.playlistCount || 0 }}</div>
              <div class="stat-label">歌单</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能导航 -->
      <div class="function-nav">
        <div class="nav-item" @click="activeTab = 'my-playlists'" :class="{ active: activeTab === 'my-playlists' }">
          <el-icon><Folder /></el-icon>
          <span>我的歌单</span>
        </div>
        <div class="nav-item" @click="activeTab = 'liked-songs'" :class="{ active: activeTab === 'liked-songs' }">
          <el-icon><Star /></el-icon>
          <span>我喜欢的</span>
        </div>
        <div class="nav-item" @click="activeTab = 'history'" :class="{ active: activeTab === 'history' }">
          <el-icon><Clock /></el-icon>
          <span>最近播放</span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-section" v-loading="loading">
        <!-- 我的歌单 -->
        <div v-if="activeTab === 'my-playlists'" class="playlists-container">
          <h3 class="section-title">
            <el-icon><Folder /></el-icon>
            我的歌单
            <span class="count">({{ myPlaylists.length }})</span>
          </h3>
          <div class="playlist-grid" v-if="myPlaylists.length > 0">
            <div
              v-for="playlist in myPlaylists"
              :key="playlist.id"
              class="playlist-card"
              @click="goToPlaylist(playlist.id)"
            >
              <div class="playlist-cover">
                <img :src="playlist.coverImgUrl || defaultCover" :alt="playlist.name" />
                <div class="playlist-overlay">
                  <div class="play-count">
                    <el-icon :size="14"><Headset /></el-icon>
                    {{ formatPlayCount(playlist.playCount) }}
                  </div>
                  <el-icon class="play-icon" :size="32"><VideoPlay /></el-icon>
                </div>
              </div>
              <div class="playlist-info">
                <h4 class="playlist-name">{{ playlist.name }}</h4>
                <p class="playlist-track-count">{{ playlist.trackCount }} 首</p>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无歌单" />
        </div>

        <!-- 我喜欢的 -->
        <div v-if="activeTab === 'liked-songs'" class="liked-songs-container">
          <h3 class="section-title">
            <el-icon><Star /></el-icon>
            我喜欢的
            <span class="count">({{ likedSongs.length }})</span>
          </h3>
          <div class="song-list" v-if="likedSongs.length > 0">
            <div
              v-for="song in likedSongs"
              :key="song.id"
              class="song-item"
            >
              <div class="song-cover">
                <img :src="song.cover || defaultCover" :alt="song.name" />
              </div>
              <div class="song-info">
                <h4 class="song-name">{{ song.title || song.name }}</h4>
                <p class="song-artist">{{ song.artist }}</p>
              </div>
              <div class="song-duration">{{ formatDuration(song.duration) }}</div>
              <el-icon class="play-btn" :size="24" @click="playSong(song)"><VideoPlay /></el-icon>
            </div>
          </div>
          <el-empty v-else description="暂无喜欢的歌曲" />
        </div>

        <!-- 最近播放 -->
        <div v-if="activeTab === 'history'" class="history-container">
          <h3 class="section-title">
            <el-icon><Clock /></el-icon>
            最近播放
            <span class="count">({{ recentPlay.length }})</span>
          </h3>
          <div class="song-list" v-if="recentPlay.length > 0">
            <div
              v-for="(song, index) in recentPlay"
              :key="song.id"
              class="song-item"
            >
              <div class="song-index">{{ index + 1 }}</div>
              <div class="song-cover">
                <img :src="song.cover || defaultCover" :alt="song.name" />
              </div>
              <div class="song-info">
                <h4 class="song-name">{{ song.title || song.name }}</h4>
                <p class="song-artist">{{ song.artist }}</p>
              </div>
              <div class="song-duration">{{ formatDuration(song.duration) }}</div>
              <el-icon class="play-btn" :size="24" @click="playSong(song)"><VideoPlay /></el-icon>
            </div>
          </div>
          <el-empty v-else description="暂无播放记录" />
        </div>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <LoginModal
      :show="showLoginModal"
      @close="showLoginModal = false"
      @login-success="handleLoginSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { usePlayerStore } from '../stores/player.js'
import { musicService } from '../api/music.js'
import { ElMessage } from 'element-plus'
import { User, Key, Avatar, Postcard, Folder, Star, Clock, Headset, VideoPlay } from '@element-plus/icons-vue'
import LoginModal from '../components/LoginModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const playerStore = usePlayerStore()

// 响应式数据
const showLoginModal = ref(false)
const loading = ref(false)
const activeTab = ref('my-playlists')
const userStats = ref(null)
const myPlaylists = ref([])
const likedSongs = ref([])
const recentPlay = ref([])

// 默认头像和封面
const defaultAvatar = 'https://picsum.photos/200/200?default=avatar'
const defaultCover = 'https://picsum.photos/200/200?default=cover'

// 格式化播放量
const formatPlayCount = (count) => {
  if (!count) return '0'
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿'
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

// 格式化时长
const formatDuration = (duration) => {
  if (!duration) return '--:--'
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 加载用户信息
const loadUserStats = async () => {
  if (!authStore.userId) return
  
  try {
    const result = await musicService.getUserDetail(authStore.userId)
    if (result.success && result.data) {
      userStats.value = {
        follows: result.data.profile?.follows || 0,
        followeds: result.data.profile?.followeds || 0,
        playlistCount: result.data.profile?.playlistCount || 0
      }
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
  }
}

// 加载用户歌单
const loadMyPlaylists = async () => {
  if (!authStore.userId) return
  
  loading.value = true
  try {
    const result = await musicService.getUserPlaylists(authStore.userId)
    if (result.success) {
      myPlaylists.value = result.data || []
    }
  } catch (error) {
    console.error('加载用户歌单失败:', error)
    ElMessage.error('加载歌单失败')
  } finally {
    loading.value = false
  }
}

// 加载喜欢的歌曲
const loadLikedSongs = async () => {
  if (!authStore.userId) return
  
  loading.value = true
  try {
    const result = await musicService.getLikedSongs(authStore.userId)
    if (result.success) {
      likedSongs.value = result.data || []
    }
  } catch (error) {
    console.error('加载喜欢的歌曲失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载最近播放
const loadRecentPlay = () => {
  loading.value = true
  try {
    // 从player store获取播放历史
    recentPlay.value = playerStore.playlist || []
  } catch (error) {
    console.error('加载最近播放失败:', error)
  } finally {
    loading.value = false
  }
}

// 跳转到歌单详情
const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

// 播放歌曲
const playSong = async (song) => {
  try {
    const formattedSong = {
      id: song.id,
      title: song.title || song.name,
      artist: song.artist,
      album: song.album,
      duration: song.duration,
      cover: song.cover,
      url: song.url || ''
    }
    await playerStore.playSong(formattedSong)
  } catch (error) {
    console.error('播放失败:', error)
  }
}

// 登录成功回调
const handleLoginSuccess = () => {
  showLoginModal.value = false
  loadUserStats()
  loadMyPlaylists()
}

// 监听tab切换
const handleTabChange = () => {
  if (activeTab.value === 'my-playlists') {
    loadMyPlaylists()
  } else if (activeTab.value === 'liked-songs') {
    loadLikedSongs()
  } else if (activeTab.value === 'history') {
    loadRecentPlay()
  }
}

// 生命周期
onMounted(() => {
  if (authStore.isLoggedIn) {
    loadUserStats()
    loadMyPlaylists()
  }
})
</script>

<style scoped>
.mine-page {
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

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xxl);
  padding: var(--spacing-xxl) 0;
  background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1) 0%, rgba(var(--color-primary-rgb), 0.05) 100%);
  border-radius: var(--radius-lg);
}

.page-header-content {
  max-width: 600px;
  margin: 0 auto;
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
}

/* 未登录状态 */
.not-logged-in {
  padding: var(--spacing-xxxl) 0;
  text-align: center;
}

/* 已登录容器 */
.logged-in-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* 用户信息卡片 */
.user-info-card {
  display: flex;
  gap: var(--spacing-xxl);
  padding: var(--spacing-xxl);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.user-avatar-section {
  flex-shrink: 0;
}

.user-avatar-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary, #c20c0c), #ff4d4f);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 2;
}

.avatar-bg-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.3);
  z-index: 1;
}

.user-detail-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-nickname {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.user-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.user-stats {
  display: flex;
  gap: var(--spacing-xxxl);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* 功能导航 */
.function-nav {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.nav-item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: var(--color-primary);
  color: white;
}

.nav-item .el-icon {
  font-size: 20px;
}

/* 内容区域 */
.content-section {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  min-height: 400px;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border);
}

.section-title .count {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin-left: var(--spacing-xs);
}

/* 歌单网格 */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-xl);
}

.playlist-card {
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
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

.playlist-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--spacing-sm);
  opacity: 0;
  transition: opacity var(--transition-normal) var(--ease-out);
}

.playlist-card:hover .playlist-overlay {
  opacity: 1;
}

.play-count {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: white;
}

.play-icon {
  color: var(--color-primary);
  background: white;
  border-radius: 50%;
  padding: var(--spacing-xs);
  align-self: flex-end;
  transition: transform var(--transition-fast) var(--ease-out);
}

.playlist-card:hover .play-icon {
  transform: scale(1.1);
}

.playlist-info {
  text-align: center;
}

.playlist-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: var(--spacing-xs);
}

.playlist-track-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}

/* 歌曲列表 */
.song-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.song-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.song-item:hover {
  background: var(--color-bg-tertiary);
}

.song-index {
  width: 30px;
  font-size: var(--font-size-base);
  color: var(--color-text-tertiary);
  text-align: center;
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
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
  margin: 0;
}

.song-duration {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.play-btn {
  color: var(--color-primary);
  opacity: 0;
  transition: all var(--transition-fast) var(--ease-out);
}

.song-item:hover .play-btn {
  opacity: 1;
}

.play-btn:hover {
  transform: scale(1.1);
}

/* 响应式 */
@media (max-width: 768px) {
  .mine-page {
    padding: var(--spacing-md);
  }

  .user-info-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-meta {
    justify-content: center;
  }

  .function-nav {
    flex-wrap: wrap;
  }

  .nav-item {
    flex: 1 1 auto;
    min-width: 100px;
  }

  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .song-item {
    padding: var(--spacing-sm);
  }

  .song-cover {
    width: 40px;
    height: 40px;
  }
}
</style>