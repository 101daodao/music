<template>
  <div class="playlist-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">📚 播放列表</h1>
      <p class="page-subtitle">管理您的音乐收藏</p>
    </div>
    
    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 创建歌单区域 -->
      <section class="create-section">
        <div class="create-card" @click="showCreateDialog = true">
          <div class="create-icon">➕</div>
          <div class="create-text">
            <h3>创建新歌单</h3>
            <p>创建您专属的音乐歌单</p>
          </div>
        </div>
      </section>
      
      <!-- 我的歌单 -->
      <section class="my-playlists-section">
        <h2 class="section-title">🎵 我的歌单</h2>
        <div class="playlist-grid">
          <div 
            v-for="(playlist, index) in myPlaylists" 
            :key="index"
            class="playlist-card"
            @click="openPlaylist(playlist)"
          >
            <div class="playlist-cover">
              <img :src="playlist.cover" :alt="playlist.name" />
              <div class="playlist-overlay">
                <div class="playlist-actions">
                  <button class="action-btn" @click.stop="playPlaylist(playlist)">▶</button>
                  <button class="action-btn" @click.stop="editPlaylist(playlist)">✏️</button>
                  <button class="action-btn" @click.stop="deletePlaylist(playlist)">🗑️</button>
                </div>
              </div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <p class="playlist-stats">{{ playlist.trackCount }} 首歌曲 · {{ playlist.playCount }} 次播放</p>
              <p class="playlist-time">更新于 {{ playlist.updateTime }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 收藏的歌单 -->
      <section class="favorite-playlists-section">
        <h2 class="section-title">❤️ 收藏的歌单</h2>
        <div class="playlist-grid">
          <div 
            v-for="(playlist, index) in favoritePlaylists" 
            :key="index"
            class="playlist-card"
            @click="openPlaylist(playlist)"
          >
            <div class="playlist-cover">
              <img :src="playlist.cover" :alt="playlist.name" />
              <div class="playlist-overlay">
                <button class="action-btn" @click.stop="playPlaylist(playlist)">▶</button>
              </div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <p class="playlist-stats">{{ playlist.trackCount }} 首歌曲 · {{ playlist.playCount }} 次播放</p>
              <p class="playlist-author">by {{ playlist.author }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    <!-- 创建歌单对话框 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click="closeCreateDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>创建新歌单</h3>
          <button class="close-btn" @click="closeCreateDialog">✕</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>歌单名称</label>
            <input v-model="newPlaylist.name" type="text" placeholder="请输入歌单名称" />
          </div>
          <div class="form-group">
            <label>歌单描述</label>
            <textarea v-model="newPlaylist.description" placeholder="请输入歌单描述（可选）"></textarea>
          </div>
          <div class="form-group">
            <label>隐私设置</label>
            <select v-model="newPlaylist.privacy">
              <option value="public">公开</option>
              <option value="private">私人</option>
            </select>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeCreateDialog">取消</button>
          <button class="confirm-btn" @click="createPlaylist">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const showCreateDialog = ref(false)
const myPlaylists = ref([
  {
    id: 1,
    name: '我喜欢的音乐',
    description: '收藏的所有喜欢的歌曲',
    cover: 'https://picsum.photos/200/200?random=myplaylist1',
    trackCount: 156,
    playCount: '3.2万',
    updateTime: '今天'
  },
  {
    id: 2,
    name: '华语经典',
    description: '经典华语歌曲收藏',
    cover: 'https://picsum.photos/200/200?random=myplaylist2',
    trackCount: 89,
    playCount: '1.8万',
    updateTime: '昨天'
  },
  {
    id: 3,
    name: '放松心情',
    description: '轻松舒缓的音乐',
    cover: 'https://picsum.photos/200/200?random=myplaylist3',
    trackCount: 45,
    playCount: '5.6千',
    updateTime: '3天前'
  },
  {
    id: 4,
    name: '运动健身',
    description: '运动时听的音乐',
    cover: 'https://picsum.photos/200/200?random=myplaylist4',
    trackCount: 67,
    playCount: '8.9千',
    updateTime: '一周前'
  }
])

const favoritePlaylists = ref([
  {
    id: 101,
    name: '流行音乐精选',
    author: '音乐达人',
    cover: 'https://picsum.photos/200/200?random=favplaylist1',
    trackCount: 234,
    playCount: '12.5万'
  },
  {
    id: 102,
    name: '深夜电台',
    author: 'DJ小王',
    cover: 'https://picsum.photos/200/200?random=favplaylist2',
    trackCount: 189,
    playCount: '9.8万'
  },
  {
    id: 103,
    name: '学习背景音乐',
    author: '学习博主',
    cover: 'https://picsum.photos/200/200?random=favplaylist3',
    trackCount: 156,
    playCount: '6.7万'
  }
])

const newPlaylist = ref({
  name: '',
  description: '',
  privacy: 'public'
})

// 方法
const openPlaylist = (playlist) => {
  console.log('打开歌单:', playlist.name)
}

const playPlaylist = (playlist) => {
  console.log('播放歌单:', playlist.name)
}

const editPlaylist = (playlist) => {
  console.log('编辑歌单:', playlist.name)
}

const deletePlaylist = (playlist) => {
  if (confirm(`确定要删除歌单"${playlist.name}"吗？`)) {
    console.log('删除歌单:', playlist.name)
    // 这里可以添加删除逻辑
  }
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  newPlaylist.value = {
    name: '',
    description: '',
    privacy: 'public'
  }
}

const createPlaylist = () => {
  if (!newPlaylist.value.name.trim()) {
    alert('请输入歌单名称')
    return
  }
  
  console.log('创建歌单:', newPlaylist.value)
  
  // 添加到我的歌单列表
  const playlist = {
    id: Date.now(),
    name: newPlaylist.value.name,
    description: newPlaylist.value.description,
    cover: `https://picsum.photos/200/200?random=${Date.now()}`,
    trackCount: 0,
    playCount: '0',
    updateTime: '刚刚'
  }
  
  myPlaylists.value.unshift(playlist)
  closeCreateDialog()
}

// 生命周期
onMounted(() => {
  console.log('播放列表页面加载完成')
})
</script>

<style scoped>
/* 页面整体样式 */
.playlist-page {
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

/* 创建歌单区域 */
.create-section {
  margin-bottom: var(--spacing-xxl);
}

.create-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
}

.create-card:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-tertiary);
  transform: translateY(-2px);
}

.create-icon {
  font-size: var(--font-size-xxl);
  color: var(--color-primary);
  background: var(--color-bg-primary);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.create-text h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.create-text p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

/* 歌单网格 */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal) var(--ease-out);
}

.playlist-card:hover .playlist-overlay {
  opacity: 1;
}

.playlist-actions {
  display: flex;
  gap: var(--spacing-md);
}

.action-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.action-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.1);
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

.playlist-stats {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-time,
.playlist-author {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.dialog-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast) var(--ease-out);
}

.close-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.dialog-content {
  padding: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast) var(--ease-out);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(194, 12, 12, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.cancel-btn,
.confirm-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.cancel-btn {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.cancel-btn:hover {
  background: var(--color-bg-tertiary);
}

.confirm-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
}

.confirm-btn:hover {
  background: var(--color-primary-dark);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-md);
  }
  
  .dialog {
    width: 95%;
    margin: var(--spacing-md);
  }
  
  .create-card {
    padding: var(--spacing-lg);
  }
  
  .create-icon {
    width: 50px;
    height: 50px;
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 576px) {
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .create-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>