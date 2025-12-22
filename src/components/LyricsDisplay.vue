<template>
  <div class="lyrics-display" :class="{ fullscreen: isFullscreen }">
    <!-- 工具栏 -->
    <div class="lyrics-toolbar" v-if="showToolbar">
      <button class="toolbar-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏显示'">
        {{ isFullscreen ? '🔳' : '🔲' }}
      </button>
      <button class="toolbar-btn" @click="toggleTranslation" :title="translationEnabled ? '隐藏翻译' : '显示翻译'">
        🌐
      </button>
      <button class="toolbar-btn" @click="toggleBackground" :title="animatedBackground ? '关闭背景动画' : '开启背景动画'">
        🎨
      </button>
      <button class="toolbar-btn" @click="adjustFontSize" title="调整字体大小">
        🔤
      </button>
    </div>

    <!-- 动态背景 -->
    <div class="lyrics-background" v-if="animatedBackground">
      <div class="bg-animation"></div>
    </div>

    <!-- 歌词容器 -->
    <div class="lyrics-container" ref="lyricsContainer" @scroll="onScroll">
      <div class="lyrics-content" :style="{ transform: `translateY(${lyricsOffset}px)` }">
        <!-- 歌曲信息 -->
        <div class="lyrics-header" v-if="songInfo">
          <h2 class="song-title">{{ songInfo.title }}</h2>
          <p class="song-artist">{{ songInfo.artist }}</p>
          <p class="song-album">{{ songInfo.album }}</p>
        </div>

        <!-- 歌词列表 -->
        <div 
          v-for="(line, index) in displayLyrics" 
          :key="index"
          class="lyric-line"
          :class="{ 
            active: index === currentLyricIndex,
            translation: line.translation && translationEnabled
          }"
          :style="{ 
            fontSize: fontSizeMap[currentFontSize] + 'px',
            lineHeight: lineHeightMap[currentFontSize]
          }"
          @click="seekToLyric(line.time)"
        >
          <div class="lyric-text">{{ line.text }}</div>
          <div class="lyric-translation" v-if="line.translation && translationEnabled">
            {{ line.translation }}
          </div>
          <div class="lyric-time" v-if="showTimestamps">
            {{ formatTime(line.time) }}
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="displayLyrics.length === 0" class="empty-lyrics">
          <div class="empty-icon">🎵</div>
          <p class="empty-text">{{ loading ? '正在加载歌词...' : '暂无歌词' }}</p>
          <button v-if="!loading" class="retry-btn" @click="$emit('retry')">
            重新加载
          </button>
        </div>
      </div>
    </div>

    <!-- 进度指示器 -->
    <div class="progress-indicator" v-if="showProgressIndicator">
      <div class="progress-line" :style="{ height: progressHeight + '%' }"></div>
    </div>

    <!-- 字体大小调整器 -->
    <div class="font-size-adjuster" v-if="showFontAdjuster">
      <button @click="decreaseFontSize" class="size-btn" :disabled="currentFontSize === 0">A-</button>
      <span class="size-label">{{ fontSizeLabels[currentFontSize] }}</span>
      <button @click="increaseFontSize" class="size-btn" :disabled="currentFontSize === fontSizeMap.length - 1">A+</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  lyrics: {
    type: Array,
    default: () => []
  },
  currentTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  songInfo: {
    type: Object,
    default: null
  },
  autoScroll: {
    type: Boolean,
    default: true
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  showTimestamps: {
    type: Boolean,
    default: false
  },
  showProgressIndicator: {
    type: Boolean,
    default: true
  },
  animatedBackground: {
    type: Boolean,
    default: true
  },
  translationEnabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['seek', 'retry', 'toggle-translation', 'toggle-background'])

// 响应式数据
const currentLyricIndex = ref(0)
const lyricsOffset = ref(0)
const isFullscreen = ref(false)
 const translationEnabled = ref(props.translationEnabled)
const animatedBackground = ref(props.animatedBackground)
const showFontAdjuster = ref(false)
const currentFontSize = ref(1) // 0: 小, 1: 中, 2: 大, 3: 特大
const isScrolling = ref(false)
const scrollTimer = ref(null)

// 配置
const fontSizeMap = [14, 16, 18, 22] // 字体大小映射
const fontSizeLabels = ['小', '中', '大', '特大']
const lineHeightMap = ['1.4', '1.6', '1.8', '2.0'] // 行高映射

// DOM 引用
const lyricsContainer = ref(null)

// 计算属性
const displayLyrics = computed(() => {
  return props.lyrics.map(line => ({
    ...line,
    translation: line.translation || null
  }))
})

const progressHeight = computed(() => {
  if (displayLyrics.value.length === 0) return 0
  return ((currentLyricIndex.value + 1) / displayLyrics.value.length) * 100
})

// 方法
const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const updateCurrentLyric = () => {
  if (!props.autoScroll || isScrolling.value) return

  let newIndex = 0
  for (let i = displayLyrics.value.length - 1; i >= 0; i--) {
    if (props.currentTime >= displayLyrics.value[i].time) {
      newIndex = i
      break
    }
  }

  if (currentLyricIndex.value !== newIndex) {
    currentLyricIndex.value = newIndex
    updateLyricsScroll()
  }
}

const updateLyricsScroll = () => {
  if (!props.autoScroll || !lyricsContainer.value) return

  nextTick(() => {
    const container = lyricsContainer.value
    const containerHeight = container.clientHeight
    const activeLine = container.querySelector('.lyric-line.active')
    
    if (activeLine) {
      const lineHeight = activeLine.offsetHeight
      const activeOffsetTop = activeLine.offsetTop
      const targetScrollTop = activeOffsetTop - (containerHeight / 2) + (lineHeight / 2)
      
      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })
    }
  })
}

const seekToLyric = (time) => {
  emit('seek', time)
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

const toggleTranslation = () => {
  translationEnabled.value = !translationEnabled.value
  emit('toggle-translation', translationEnabled.value)
}

const toggleBackground = () => {
  animatedBackground.value = !animatedBackground.value
  emit('toggle-background', animatedBackground.value)
}

const adjustFontSize = () => {
  showFontAdjuster.value = !showFontAdjuster.value
}

const increaseFontSize = () => {
  if (currentFontSize.value < fontSizeMap.length - 1) {
    currentFontSize.value++
    updateLyricsScroll()
  }
}

const decreaseFontSize = () => {
  if (currentFontSize.value > 0) {
    currentFontSize.value--
    updateLyricsScroll()
  }
}

const onScroll = () => {
  isScrolling.value = true
  clearTimeout(scrollTimer.value)
  scrollTimer.value = setTimeout(() => {
    isScrolling.value = false
  }, 150)
}

const handleKeydown = (event) => {
  switch (event.key) {
    case 'Escape':
      if (isFullscreen.value) {
        toggleFullscreen()
      }
      break
    case '+':
    case '=':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        increaseFontSize()
      }
      break
    case '-':
    case '_':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        decreaseFontSize()
      }
      break
  }
}

// 监听器
watch(() => props.currentTime, updateCurrentLyric)
watch(() => props.lyrics, () => {
  currentLyricIndex.value = 0
  updateLyricsScroll()
}, { deep: true })

watch(() => props.translationEnabled, (newVal) => {
  translationEnabled.value = newVal
})

watch(() => props.animatedBackground, (newVal) => {
  animatedBackground.value = newVal
})

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  updateCurrentLyric()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (scrollTimer.value) {
    clearTimeout(scrollTimer.value)
  }
})

// 暴露方法给父组件
defineExpose({
  scrollToCurrent: updateLyricsScroll,
  toggleFullscreen,
  adjustFontSize
})
</script>

<style scoped>
.lyrics-display {
  position: relative;
  height: 100%;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  overflow: hidden;
}

.lyrics-display.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-index-modal);
  background: var(--color-bg-primary);
}

/* 工具栏 */
.lyrics-toolbar {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-sm);
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  padding: var(--spacing-sm);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
}

.fullscreen .lyrics-toolbar {
  background: rgba(0, 0, 0, 0.3);
}

.toolbar-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--color-text-inverse);
  font-size: var(--font-size-base);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  backdrop-filter: blur(5px);
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* 动态背景 */
.lyrics-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.bg-animation {
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    var(--color-primary) 0%,
    var(--color-secondary) 25%,
    var(--color-accent) 50%,
    var(--color-primary) 75%,
    var(--color-secondary) 100%
  );
  animation: backgroundMove 20s linear infinite;
  opacity: 0.1;
}

@keyframes backgroundMove {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* 歌词容器 */
.lyrics-container {
  position: relative;
  height: 100%;
  overflow-y: auto;
  z-index: 2;
  scroll-behavior: smooth;
  padding: var(--spacing-xl) 0;
}

.lyrics-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 歌曲信息 */
.lyrics-header {
  text-align: center;
  margin-bottom: var(--spacing-xxl);
  padding: var(--spacing-xl);
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
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

/* 歌词行 */
.lyric-line {
  text-align: center;
  margin: var(--spacing-lg) 0;
  cursor: pointer;
  transition: all var(--transition-normal) var(--ease-out);
  position: relative;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  opacity: 0.6;
  transform: scale(0.95);
}

.lyric-line:hover {
  opacity: 0.8;
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.05);
}

.lyric-line.active {
  opacity: 1;
  transform: scale(1.05);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  background: rgba(var(--color-primary-rgb), 0.1);
  box-shadow: 0 4px 20px rgba(var(--color-primary-rgb), 0.3);
}

.lyric-text {
  margin-bottom: var(--spacing-xs);
  transition: all var(--transition-fast) var(--ease-out);
}

.lyric-translation {
  font-size: 0.9em;
  color: var(--color-text-secondary);
  opacity: 0.8;
  font-style: italic;
}

.lyric-time {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8em;
  color: var(--color-text-tertiary);
  opacity: 0;
  transition: opacity var(--transition-fast) var(--ease-out);
}

.lyric-line:hover .lyric-time {
  opacity: 1;
}

/* 空状态 */
.empty-lyrics {
  text-align: center;
  padding: var(--spacing-xxl);
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: var(--font-size-xxxl);
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-text {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-lg);
}

.retry-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.retry-btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

/* 进度指示器 */
.progress-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-border);
  z-index: 5;
}

.progress-line {
  background: var(--color-primary);
  width: 100%;
  transition: height var(--transition-fast) var(--ease-out);
  box-shadow: 0 0 10px var(--color-primary);
}

/* 字体大小调整器 */
.font-size-adjuster {
  position: absolute;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: rgba(0, 0, 0, 0.5);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.size-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--color-text-inverse);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
  font-weight: var(--font-weight-bold);
}

.size-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.size-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.size-label {
  color: var(--color-text-inverse);
  font-size: var(--font-size-sm);
  min-width: 30px;
  text-align: center;
}

/* 滚动条样式 */
.lyrics-container::-webkit-scrollbar {
  width: 6px;
}

.lyrics-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-round);
}

.lyrics-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-round);
}

.lyrics-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lyrics-content {
    padding: 0 var(--spacing-md);
  }
  
  .lyrics-toolbar {
    top: var(--spacing-md);
    right: var(--spacing-md);
  }
  
  .song-title {
    font-size: var(--font-size-xl);
  }
  
  .song-artist {
    font-size: var(--font-size-base);
  }
  
  .lyric-line {
    margin: var(--spacing-md) 0;
    padding: var(--spacing-sm);
  }
  
  .font-size-adjuster {
    bottom: var(--spacing-md);
    padding: var(--spacing-xs) var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .lyrics-toolbar {
    gap: var(--spacing-xs);
  }
  
  .toolbar-btn {
    padding: var(--spacing-xs);
    font-size: var(--font-size-sm);
  }
  
  .song-artist {
    font-size: var(--font-size-sm);
  }
  
  .lyric-time {
    display: none;
  }
}
</style>