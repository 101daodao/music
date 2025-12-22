<template>
  <div class="mine-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">👤 个人中心</h1>
      <p class="page-subtitle">管理您的音乐和偏好设置</p>
    </div>
    
    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 用户信息卡片 -->
      <section class="user-section">
        <div class="user-card">
          <div class="user-avatar-large">
            <img :src="userInfo.avatar" :alt="userInfo.nickname" />
            <button class="avatar-edit-btn" @click="editAvatar">
              📷
            </button>
          </div>
          <div class="user-info">
            <h2 class="user-name">{{ userInfo.nickname }}</h2>
            <p class="user-signature">{{ userInfo.signature }}</p>
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-number">{{ userInfo.follows }}</span>
                <span class="stat-label">关注</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ userInfo.fans }}</span>
                <span class="stat-label">粉丝</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ userInfo.playCount }}</span>
                <span class="stat-label">播放</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 用户歌单 -->
      <section class="playlist-section">
        <div class="section-header">
          <h2 class="section-title">📚 我的歌单</h2>
          <button class="create-playlist-btn" @click="createPlaylist">
            ➕ 创建歌单
          </button>
        </div>
        <div class="playlist-grid">
          <div 
            v-for="(playlist, index) in userPlaylists" 
            :key="index"
            class="playlist-card"
            @click="openPlaylist(playlist)"
          >
            <div class="playlist-cover">
              <img :src="playlist.cover" :alt="playlist.name" />
              <div class="playlist-overlay">
                <span class="play-count">🎵 {{ playlist.playCount }}</span>
              </div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <p class="playlist-track-count">{{ playlist.trackCount }} 首歌曲</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 最近播放 -->
      <section class="recent-section">
        <h2 class="section-title">⏰ 最近播放</h2>
        <div class="recent-list">
          <div 
            v-for="(item, index) in recentTracks" 
            :key="index"
            class="recent-item"
            @click="playTrack(item)"
          >
            <div class="recent-cover">
              <img :src="item.cover" :alt="item.title" />
            </div>
            <div class="recent-info">
              <h4 class="recent-title">{{ item.title }}</h4>
              <p class="recent-artist">{{ item.artist }}</p>
              <p class="recent-time">{{ item.playTime }}</p>
            </div>
            <button class="recent-play-btn" @click.stop="playTrack(item)">
              ▶
            </button>
          </div>
        </div>
      </section>
      
      <!-- 设置区域 -->
      <section class="settings-section">
        <h2 class="section-title">⚙️ 个人设置</h2>
        <div class="settings-list">
          <div class="setting-item" @click="openSetting('profile')">
            <span class="setting-icon">👤</span>
            <span class="setting-label">个人资料</span>
            <span class="setting-arrow">›</span>
          </div>
          <div class="setting-item" @click="openSetting('privacy')">
            <span class="setting-icon">🔒</span>
            <span class="setting-label">隐私设置</span>
            <span class="setting-arrow">›</span>
          </div>
          <div class="setting-item" @click="openSetting('notification')">
            <span class="setting-icon">🔔</span>
            <span class="setting-label">通知设置</span>
            <span class="setting-arrow">›</span>
          </div>
          <div class="setting-item" @click="openSetting('quality')">
            <span class="setting-icon">🎵</span>
            <span class="setting-label">音质设置</span>
            <span class="setting-arrow">›</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const userInfo = ref({
  nickname: '音乐爱好者',
  signature: '热爱生活，热爱音乐 🎵',
  avatar: 'https://picsum.photos/150/150?random=avatar',
  follows: 128,
  fans: 1024,
  playCount: '8.5万'
})

const userPlaylists = ref([
  {
    id: 1,
    name: '我喜欢的音乐',
    cover: 'https://picsum.photos/200/200?random=playlist1',
    trackCount: 156,
    playCount: 3280
  },
  {
    id: 2,
    name: '华语经典',
    cover: 'https://picsum.photos/200/200?random=playlist2',
    trackCount: 89,
    playCount: 2156
  },
  {
    id: 3,
    name: '放松心情',
    cover: 'https://picsum.photos/200/200?random=playlist3',
    trackCount: 45,
    playCount: 987
  },
  {
    id: 4,
    name: '运动健身',
    cover: 'https://picsum.photos/200/200?random=playlist4',
    trackCount: 67,
    playCount: 1543
  }
])

const recentTracks = ref([
  {
    id: 1,
    title: '夜曲',
    artist: '周杰伦',
    cover: 'https://picsum.photos/60/60?random=track1',
    playTime: '10分钟前'
  },
  {
    id: 2,
    title: '晴天',
    artist: '周杰伦',
    cover: 'https://picsum.photos/60/60?random=track2',
    playTime: '25分钟前'
  },
  {
    id: 3,
    title: '告白气球',
    artist: '周杰伦',
    cover: 'https://picsum.photos/60/60?random=track3',
    playTime: '1小时前'
  },
  {
    id: 4,
    title: '稻香',
    artist: '周杰伦',
    cover: 'https://picsum.photos/60/60?random=track4',
    playTime: '2小时前'
  },
  {
    id: 5,
    title: '青花瓷',
    artist: '周杰伦',
    cover: 'https://picsum.photos/60/60?random=track5',
    playTime: '3小时前'
  }
])

// 方法
const editAvatar = () => {
  console.log('编辑头像')
  // 这里可以添加上传头像的逻辑
}

const createPlaylist = () => {
  console.log('创建歌单')
  // 这里可以添加创建歌单的逻辑
}

const openPlaylist = (playlist) => {
  console.log('打开歌单:', playlist.name)
  // 这里可以添加跳转到歌单详情页的逻辑
}

const playTrack = (track) => {
  console.log('播放歌曲:', track.title)
  // 这里可以添加播放歌曲的逻辑
}

const openSetting = (type) => {
  console.log('打开设置:', type)
  // 这里可以添加打开对应设置页面的逻辑
}

// 加载用户数据
const loadUserData = async () => {
  try {
    // 这里可以调用API获取用户数据
    console.log('加载用户数据...')
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
}

// 加载用户歌单
const loadUserPlaylists = async () => {
  try {
    // 这里可以调用API获取用户歌单
    console.log('加载用户歌单...')
  } catch (error) {
    console.error('加载用户歌单失败:', error)
  }
}

// 加载最近播放
const loadRecentTracks = async () => {
  try {
    // 这里可以调用API获取最近播放记录
    console.log('加载最近播放...')
  } catch (error) {
    console.error('加载最近播放失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadUserData()
  loadUserPlaylists()
  loadRecentTracks()
})
</script>

<style scoped>
/* 页面整体样式 */
.mine-page {
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

/* 用户信息卡片 */
.user-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xxl);
}

.user-avatar-large {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--color-bg-primary);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-fast) var(--ease-out);
}

.avatar-edit-btn:hover {
  transform: scale(1.1);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
}

.user-signature {
  font-size: var(--font-size-base);
  opacity: 0.9;
  margin-bottom: var(--spacing-lg);
}

.user-stats {
  display: flex;
  gap: var(--spacing-xl);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.stat-label {
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

/* 歌单区域 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.create-playlist-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast) var(--ease-out);
}

.create-playlist-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

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

.playlist-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: var(--spacing-md);
  opacity: 0;
  transition: opacity var(--transition-normal) var(--ease-out);
}

.playlist-card:hover .playlist-overlay {
  opacity: 1;
}

.play-count {
  color: var(--color-text-inverse);
  font-size: var(--font-size-sm);
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

.playlist-track-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* 最近播放列表 */
.recent-list {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--spacing-xxl);
}

.recent-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color var(--transition-fast) var(--ease-out);
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-item:hover {
  background-color: var(--color-bg-tertiary);
}

.recent-cover {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.recent-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recent-info {
  flex: 1;
  margin-left: var(--spacing-md);
}

.recent-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.recent-artist {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.recent-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.recent-play-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
}

.recent-play-btn:hover {
  transform: scale(1.1);
  background: var(--color-primary-dark);
}

/* 设置列表 */
.settings-list {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color var(--transition-fast) var(--ease-out);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background-color: var(--color-bg-tertiary);
}

.setting-icon {
  font-size: var(--font-size-lg);
  margin-right: var(--spacing-md);
}

.setting-label {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.setting-arrow {
  font-size: var(--font-size-xl);
  color: var(--color-text-tertiary);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .user-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-lg);
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--spacing-md);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
}

@media (max-width: 576px) {
  .user-card {
    padding: var(--spacing-lg);
  }
  
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recent-item {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .recent-cover {
    width: 40px;
    height: 40px;
  }
}
</style>