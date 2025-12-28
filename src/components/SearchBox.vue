<template>
  <div class="search-box" :class="{ expanded: isExpanded || searchResults.length > 0 }">
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
        placeholder="搜索歌曲、歌手、专辑"
      />
      <button class="search-button" @click="onSearch" :disabled="!searchQuery.trim()">
        <el-icon :size="16"><Search /></el-icon>
      </button>
    </div>
    
    <!-- 搜索建议下拉框 -->
    <div 
      v-if="showSuggestions && (searchResults.length > 0 || isSearching)" 
      class="search-suggestions"
    >
      <!-- 搜索状态 -->
      <div v-if="isSearching" class="search-status">
        <div class="loading-spinner"></div>
        <span>搜索中...</span>
      </div>
      
      <!-- 搜索结果 -->
      <div v-else-if="searchResults.length > 0" class="search-results">
        <div 
          v-for="(result, index) in searchResults" 
          :key="result.id"
          class="search-result-item"
          :class="{ highlighted: index === highlightedIndex }"
          @click="selectResult(result)"
          @mouseenter="highlightedIndex = index"
        >
          <div class="result-cover">
            <img :src="result.cover || defaultCover" :alt="result.title" />
          </div>
          <div class="result-info">
            <h4 class="result-title">{{ highlightMatch(result.title) }}</h4>
            <p class="result-artist">{{ highlightMatch(result.artist) }}</p>
            <p class="result-album">{{ result.album || '未知专辑' }}</p>
          </div>
          <div class="result-duration" v-if="result.duration">
            {{ result.duration }}
          </div>
        </div>
      </div>
      
      <!-- 无结果 -->
      <div v-else-if="searchQuery.trim()" class="no-results">
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
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索歌曲、歌手、专辑'
  }
})

const emit = defineEmits(['search', 'select-song'])

// 响应式数据
const router = useRouter()
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const isExpanded = ref(false)
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)

// 默认封面
const defaultCover = 'https://picsum.photos/48/48?default=search'

// 防抖计时器
let searchTimer = null

// 计算属性
const hasValidQuery = computed(() => {
  return searchQuery.value.trim().length > 0
})

// 搜索方法
const performSearch = async (query) => {
  if (!query.trim()) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  showSuggestions.value = true
  
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 这里应该调用真实API，暂时使用模拟数据
    const mockResults = [
      {
        id: 1,
        title: '夜曲',
        artist: '周杰伦',
        album: '十一月的萧邦',
        cover: 'https://picsum.photos/48/48?search1',
        duration: '3:46'
      },
      {
        id: 2,
        title: '晴天',
        artist: '周杰伦',
        album: '叶惠美',
        cover: 'https://picsum.photos/48/48?search2',
        duration: '4:29'
      },
      {
        id: 3,
        title: '告白气球',
        artist: '周杰伦',
        album: '周杰伦的床边故事',
        cover: 'https://picsum.photos/48/48?search3',
        duration: '3:35'
      }
    ].filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.artist.toLowerCase().includes(query.toLowerCase()) ||
      item.album.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10)
    
    searchResults.value = mockResults
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
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
  if (hasValidQuery.value) {
    showSuggestions.value = true
  }
}

const onSearch = () => {
  if (hasValidQuery.value) {
    emit('search', searchQuery.value)
    closeSearch()
    
    // 可以跳转到搜索结果页面
    router.push({
      name: 'SearchResults',
      query: { q: searchQuery.value }
    })
  }
}

const selectResult = (result) => {
  emit('select-song', result)
  closeSearch()
  
  // 播放选中的歌曲
  const musicPlayer = document.querySelector('music-player')
  if (musicPlayer) {
    musicPlayer.playSong(result)
  }
}

const closeSearch = () => {
  showSuggestions.value = false
  isExpanded.value = false
  searchResults.value = []
  highlightedIndex.value = -1
}

// 键盘导航
const highlightNext = () => {
  if (searchResults.value.length > 0) {
    highlightedIndex.value = (highlightedIndex.value + 1) % searchResults.value.length
    scrollToHighlighted()
  }
}

const highlightPrev = () => {
  if (searchResults.value.length > 0) {
    highlightedIndex.value = highlightedIndex.value <= 0 
      ? searchResults.value.length - 1 
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
  if (!searchQuery.value.trim()) return text
  
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
  if (searchResults.value.length > 0) {
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
    searchResults.value = []
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
  max-height: 400px;
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

/* 搜索结果 */
.search-results {
  max-height: 400px;
  overflow-y: auto;
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
}

.result-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
    max-height: 300px;
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