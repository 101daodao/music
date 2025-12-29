<template>
  <div class="search-box" :class="{ expanded: isExpanded || showSuggestions }">
    <div class="search-input-wrapper">
      <input
        type="text"
        class="search-input"
        v-model="searchQuery"
        @input="onSearchInput"
        @focus="onFocus"
        @keydown.enter="onSearch"
        @keydown.down="highlightNext"
        @keydown.up="highlightPrev"
        @keydown.escape="closeSearch"
        placeholder="搜索歌曲、歌手、专辑、歌单"
      />
      <button class="search-button" @click="onSearch" :disabled="!searchQuery.trim()">
        <el-icon :size="16"><Search /></el-icon>
      </button>
    </div>
    
    <!-- 搜索建议下拉框 -->
    <div 
      v-if="showSuggestions" 
      class="search-suggestions"
    >
      <!-- 搜索状态 -->
      <div v-if="isSearching" class="search-status">
        <div class="loading-spinner"></div>
        <span>搜索中...</span>
      </div>
      
      <!-- 搜索示例 -->
      <div v-else-if="searchResults.songs.length === 0 && searchResults.playlists.length === 0 && searchQuery.trim() === ''" class="search-examples">
        <div class="examples-title">热门搜索</div>
        <div class="examples-tags">
          <span 
            v-for="(example, index) in searchExamples" 
            :key="index"
            class="example-tag"
            @click="searchExample(example.keyword)"
          >
            {{ example.tag }}
          </span>
        </div>
      </div>
      
      <!-- 搜索结果 -->
      <div v-else-if="hasResults" class="search-results">
        <!-- 歌曲结果 -->
        <div v-if="searchResults.songs.length > 0" class="result-section">
          <div class="result-section-title">
            <span>🎵 歌曲</span>
            <span class="result-count">{{ searchResults.songs.length }}</span>
          </div>
          <div 
            v-for="(song, index) in searchResults.songs" 
            :key="song.id"
            class="search-result-item"
            :class="{ highlighted: highlightedIndex === index }"
            @click="playSong(song)"
            @mouseenter="highlightedIndex = index"
          >
            <div class="result-cover">
              <img :src="song.cover || defaultCover" :alt="song.name" />
              <div class="play-overlay">
                <span class="play-icon">▶</span>
              </div>
            </div>
            <div class="result-info">
              <h4 class="result-title">{{ highlightMatch(song.name) }}</h4>
              <p class="result-artist">{{ highlightMatch(song.artist) }}</p>
              <p class="result-album">{{ song.album }}</p>
            </div>
            <div class="result-duration">
              {{ formatDuration(song.duration) }}
            </div>
          </div>
        </div>
        
        <!-- 歌单结果 -->
        <div v-if="searchResults.playlists.length > 0" class="result-section">
          <div class="result-section-title">
            <span>📋 歌单</span>
            <span class="result-count">{{ searchResults.playlists.length }}</span>
          </div>
          <div 
            v-for="(playlist, index) in searchResults.playlists" 
            :key="playlist.id"
            class="search-result-item playlist-item"
            :class="{ highlighted: highlightedIndex === searchResults.songs.length + index }"
            @click="goToPlaylist(playlist)"
            @mouseenter="highlightedIndex = searchResults.songs.length + index"
          >
            <div class="result-cover">
              <img :src="playlist.cover || defaultCover" :alt="playlist.name" />
            </div>
            <div class="result-info">
              <h4 class="result-title">{{ highlightMatch(playlist.name) }}</h4>
              <p class="result-artist">{{ highlightMatch(playlist.creator) }}</p>
              <p class="result-album">{{ playlist.trackCount }}首 • {{ formatPlayCount(playlist.playCount) }}</p>
            </div>
            <div class="result-arrow">
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无结果 -->
      <div v-else-if="!isSearching && searchQuery.trim() && !hasResults" class="no-results">
        <span>🔍</span>
        <p>未找到相关结果</p>
        <small>尝试使用其他关键词</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player.js'
import { musicService } from '../api/music.js'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索歌曲、歌手、专辑、歌单'
  }
})

const emit = defineEmits(['search', 'select-song'])

// 响应式数据
const router = useRouter()
const playerStore = usePlayerStore()
const searchQuery = ref('')
const searchResults = ref({ songs: [], playlists: [] })
const isSearching = ref(false)
const isExpanded = ref(false)
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)

// 默认封面
const defaultCover = 'https://picsum.photos/48/48?default=search'

// 搜索示例
const searchExamples = [
  { tag: '周杰伦', keyword: '周杰伦' },
  { tag: '告白气球', keyword: '告白气球' },
  { tag: '流行金曲', keyword: '流行' },
  { tag: '古风歌单', keyword: '古风' }
]

// 防抖计时器
let searchTimer = null

// 计算属性
const hasValidQuery = computed(() => {
  return searchQuery.value.trim().length > 0
})

const hasResults = computed(() => {
  return searchResults.value.songs.length > 0 || searchResults.value.playlists.length > 0
})

// 格式化时长
const formatDuration = (duration) => {
  if (!duration) return '--:--'
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

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

// 搜索方法
const performSearch = async (query) => {
  if (!query.trim()) {
    searchResults.value = { songs: [], playlists: [] }
    return
  }
  
  isSearching.value = true
  showSuggestions.value = true
  
  try {
    const result = await musicService.searchAll(query, 5)
    
    if (result.success) {
      searchResults.value = result.data
    } else {
      console.error('搜索失败:', result.error)
      searchResults.value = { songs: [], playlists: [] }
    }
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = { songs: [], playlists: [] }
  } finally {
    isSearching.value = false
  }
}

// 搜索示例
const searchExample = (keyword) => {
  searchQuery.value = keyword
  performSearch(keyword)
}

// 播放歌曲
const playSong = async (song) => {
  try {
    // 转换数据格式以匹配播放器期望的格式
    const formattedSong = {
      id: song.id,
      title: song.name || song.title,
      artist: song.artist,
      album: song.album,
      duration: song.duration,
      cover: song.coverUrl || song.cover,
      url: song.url || ''
    }
    
    // 调用player store的playSong方法，该方法会自动添加到播放列表并播放
    await playerStore.playSong(formattedSong)
    closeSearch()
  } catch (error) {
    console.error('播放失败:', error)
  }
}

// 跳转歌单
const goToPlaylist = (playlist) => {
  router.push({
    name: 'Playlist',
    params: { id: playlist.id }
  })
  closeSearch()
}

// 事件处理
const onSearchInput = () => {
  // 清除之前的搜索计时器
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  // 防抖搜索
  searchTimer = setTimeout(() => {
    performSearch(searchQuery.value)
  }, 300)
  
  highlightedIndex.value = -1
}

const onFocus = () => {
  isExpanded.value = true
  if (hasValidQuery.value || searchResults.value.songs.length > 0 || searchResults.value.playlists.length > 0) {
    showSuggestions.value = true
  } else {
    showSuggestions.value = true // 显示搜索示例
  }
}

const onSearch = () => {
  if (hasValidQuery.value) {
    emit('search', searchQuery.value)
    // 搜索完成后保持下拉框显示，让用户选择结果
    performSearch(searchQuery.value)
  }
}

const closeSearch = () => {
  showSuggestions.value = false
  isExpanded.value = false
  // 不清空搜索结果和查询，保留用户输入
  highlightedIndex.value = -1
}

// 键盘导航
const highlightNext = () => {
  const totalResults = searchResults.value.songs.length + searchResults.value.playlists.length
  if (totalResults > 0) {
    highlightedIndex.value = (highlightedIndex.value + 1) % totalResults
    scrollToHighlighted()
  }
}

const highlightPrev = () => {
  const totalResults = searchResults.value.songs.length + searchResults.value.playlists.length
  if (totalResults > 0) {
    highlightedIndex.value = highlightedIndex.value <= 0 
      ? totalResults - 1 
      : highlightedIndex.value - 1
    scrollToHighlighted()
  }
}

const scrollToHighlighted = () => {
  nextTick(() => {
    const highlightedElement = document.querySelector('.search-result-item.highlighted')
    if (highlightedElement) {
      highlightedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  })
}

// 高亮匹配文本
const highlightMatch = (text) => {
  if (!searchQuery.value.trim() || !text) return text
  
  const regex = new RegExp(`(${searchQuery.value.trim()})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 点击外部关闭搜索
const handleClickOutside = (event) => {
  const searchBox = event.target.closest('.search-box')
  if (!searchBox) {
    closeSearch()
  }
}

// 监听搜索结果变化
watch(searchResults, () => {
  if (hasResults.value) {
    showSuggestions.value = true
  }
})

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})

// 暴露方法
defineExpose({
  focus: () => {
    const input = document.querySelector('.search-input')
    if (input) input.focus()
  },
  clear: () => {
    searchQuery.value = ''
    searchResults.value = { songs: [], playlists: [] }
    closeSearch()
  }
})
</script>

<style scoped>
.search-box {
  position: relative;
  width: 100%;
  max-width: 400px;
  transition: all var(--transition-normal) var(--ease-out);
}

.search-box.expanded {
  max-width: 500px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 36px;
  padding: 0 var(--spacing-lg) 0 var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast) var(--ease-out);
  outline: none;
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(194, 12, 12, 0.1);
  background-color: var(--color-bg-primary);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.search-button {
  position: absolute;
  right: var(--spacing-xs);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover:not(:disabled) {
  color: var(--color-primary);
  background-color: var(--color-bg-tertiary);
}

.search-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-button .el-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 搜索建议下拉框 */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 500px;
  overflow-y: auto;
  z-index: var(--z-index-dropdown);
  margin-top: var(--spacing-xs);
}

/* 搜索状态 */
.search-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 搜索示例 */
.search-examples {
  padding: var(--spacing-lg);
}

.examples-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  font-weight: var(--font-weight-medium);
}

.examples-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.example-tag {
  display: inline-block;
  padding: 6px 12px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  border: 1px solid transparent;
}

.example-tag:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border);
  color: var(--color-primary);
}

/* 搜索结果 */
.search-results {
  max-height: 500px;
  overflow-y: auto;
}

.result-section {
  border-bottom: 1px solid var(--color-border-light);
}

.result-section:last-child {
  border-bottom: none;
}

.result-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  position: sticky;
  top: 0;
  z-index: 1;
}

.result-count {
  color: var(--color-text-tertiary);
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: background-color var(--transition-fast) var(--ease-out);
  border-bottom: 1px solid var(--color-border-light);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover,
.search-result-item.highlighted {
  background-color: var(--color-bg-tertiary);
}

.result-cover {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.result-cover img {
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
  transition: opacity var(--transition-fast) var(--ease-out);
}

.search-result-item:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  color: white;
  font-size: 18px;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-artist {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-album {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-duration {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.result-arrow {
  font-size: var(--font-size-lg);
  color: var(--color-text-tertiary);
  opacity: 0;
  transition: opacity var(--transition-fast) var(--ease-out);
}

.playlist-item:hover .result-arrow {
  opacity: 1;
}

/* 高亮匹配文本 */
:deep(mark) {
  background-color: var(--color-warning);
  color: var(--color-text-primary);
  padding: 1px 2px;
  border-radius: 2px;
}

/* 无结果状态 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--color-text-tertiary);
  text-align: center;
}

.no-results span {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.no-results p {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-sm);
}

.no-results small {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-box {
    max-width: 300px;
  }
  
  .search-box.expanded {
    max-width: 350px;
  }
  
  .search-suggestions {
    max-height: 400px;
  }
}

@media (max-width: 576px) {
  .search-box {
    max-width: 250px;
  }
  
  .search-box.expanded {
    max-width: 280px;
  }
  
  .search-result-item {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .result-cover {
    width: 40px;
    height: 40px;
  }
}

/* 滚动条样式 */
.search-suggestions::-webkit-scrollbar {
  width: 4px;
}

.search-suggestions::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

.search-suggestions::-webkit-scrollbar-thumb {
  background: var(--color-border-dark);
  border-radius: var(--radius-round);
}
</style>