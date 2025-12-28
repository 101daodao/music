<template>
  <div class="my-playlists-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">
        <el-icon :size="32"><Folder /></el-icon> 我的歌单
      </h1>
      <p class="page-subtitle">发现优质音乐，享受精彩生活</p>
    </div>
    
    <!-- 页面内容 -->
    <div class="page-content" v-loading="loading">
      <!-- 精品歌单 -->
      <section class="playlist-section" v-if="playlists.length > 0">
        <h2 class="section-title">
          <el-icon :size="20"><Star /></el-icon> 精品歌单
        </h2>
        <div class="playlist-grid">
          <div
            v-for="playlist in playlists"
            :key="playlist.id"
            class="playlist-card"
            @click="goToPlaylist(playlist.id)"
          >
            <div class="playlist-cover">
              <img :src="playlist.coverImgUrl" :alt="playlist.name" />
              <div class="playlist-overlay">
                <div class="play-count">
                  <el-icon :size="14"><Headset /></el-icon>
                  {{ formatPlayCount(playlist.playCount) }}
                </div>
                <el-icon class="play-icon" :size="32"><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="playlist-info">
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <p class="playlist-creator">{{ playlist.creator }}</p>
              <p class="playlist-desc">{{ playlist.description }}</p>
              <div class="playlist-meta">
                <span class="meta-item">
                  <el-icon :size="12"><MusicIcon /></el-icon>
                  {{ playlist.trackCount }} 首
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 空状态 -->
      <el-empty v-else-if="!loading" description="暂无歌单" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { musicService, formatPlayCount } from '../api/music.js'
import { ElMessage } from 'element-plus'
import { Folder, Star, Headset, VideoPlay, Headset as MusicIcon } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(true)
const playlists = ref([])

// 加载歌单列表
const loadPlaylists = async () => {
  loading.value = true
  try {
    const result = await musicService.getHighQualityPlaylists(20)
    
    if (result.success) {
      playlists.value = result.data
    } else {
      ElMessage.error('加载歌单失败：' + result.error)
    }
  } catch (error) {
    console.error('加载歌单出错:', error)
    ElMessage.error('加载歌单失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 跳转到歌单详情
const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

onMounted(() => {
  loadPlaylists()
})
</script>

<style scoped>
.my-playlists-page {
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

/* 歌单区域 */
.playlist-section {
  margin-bottom: var(--spacing-xxl);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-primary);
}

/* 歌单卡片网格 */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-xl);
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
  transform: translateY(-8px);
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
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--spacing-md);
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
  font-size: var(--font-size-sm);
  color: white;
  margin-bottom: var(--spacing-sm);
}

.play-icon {
  color: var(--color-primary);
  align-self: flex-end;
  background: white;
  border-radius: 50%;
  padding: var(--spacing-sm);
  transition: transform var(--transition-fast) var(--ease-out);
}

.playlist-card:hover .play-icon {
  transform: scale(1.1);
}

.playlist-info {
  padding: var(--spacing-md);
}

.playlist-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.playlist-creator {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.playlist-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.playlist-meta {
  display: flex;
  gap: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-playlists-page {
    padding: var(--spacing-md);
  }

  .page-header {
    padding: var(--spacing-lg) 0;
  }

  .page-title {
    font-size: var(--font-size-xl);
  }

  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .playlist-grid {
    grid-template-columns: 1fr;
  }
}
</style>