<template>
  <div class="music-player" :class="{ expanded: isExpanded }">
    <!-- 播放器主体 -->
    <div class="player-main">
      <!-- 歌曲信息 -->
      <div class="track-info">
        <div class="album-cover" :class="{ rotating: isPlaying }" @click="toggleExpanded">
          <img :src="currentSong?.cover || defaultCover" :alt="currentSong?.title" />
          <div class="play-overlay">
            <span class="play-icon">{{ isPlaying ? '⏸' : '▶' }}</span>
          </div>
        </div>
        <div class="track-details">
          <h4 class="track-title">{{ currentSong?.title || '暂无播放' }}</h4>
          <p class="track-artist">{{ currentSong?.artist || '未知歌手' }}</p>
        </div>
      </div>
      
      <!-- 播放控制 -->
      <div class="player-controls">
        <!-- 播放模式 -->
        <button class="control-btn" @click="togglePlayMode" :title="playModeTitle">
          <span>{{ playModeIcon }}</span>
        </button>
        
        <!-- 上一首 -->
        <button class="control-btn" @click="prevSong" :disabled="!canPrev">
          <span>⏮</span>
        </button>
        
        <!-- 播放/暂停 -->
        <button class="play-pause-btn" @click="togglePlay">
          <span>{{ isPlaying ? '⏸' : '▶' }}</span>
        </button>
        
        <!-- 下一首 -->
        <button class="control-btn" @click="nextSong" :disabled="!canNext">
          <span>⏭</span>
        </button>
        
        <!-- 音量 -->
        <div class="volume-control">
          <button class="control-btn" @click="toggleMute">
            <span>{{ volumeIcon }}</span>
          </button>
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
      
      <!-- 进度条 -->
      <div class="progress-section">
        <span class="time-text">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="seekTo">
          <div class="progress-buffer" :style="{ width: bufferProgress + '%' }"></div>
          <div class="progress-current" :style="{ width: progressPercentage + '%' }"></div>
          <div class="progress-thumb" :style="{ left: progressPercentage + '%' }"></div>
        </div>
        <span class="time-text">{{ formatTime(duration) }}</span>
      </div>
    </div>
    
    <!-- 展开的播放器（包含歌词） -->
    <div class="player-expanded" v-if="isExpanded">
      <div class="expanded-header">
        <button class="collapse-btn" @click="isExpanded = false">✕</button>
      </div>
      <div class="expanded-content">
        <!-- 专辑封面大图 -->
        <div class="large-cover">
          <img :src="currentSong?.cover || defaultCover" :alt="currentSong?.title" 
               :class="{ rotating: isPlaying }" />
        </div>
        
        <!-- 歌曲详细信息 -->
        <div class="song-info">
          <h2 class="song-title">{{ currentSong?.title || '暂无播放' }}</h2>
          <p class="song-artist">{{ currentSong?.artist || '未知歌手' }}</p>
          <p class="song-album">{{ currentSong?.album || '未知专辑' }}</p>
        </div>
        
        <!-- 歌词显示 -->
        <div class="lyrics-container" ref="lyricsContainer">
          <div class="lyrics-content" :style="{ transform: `translateY(${lyricsOffset}px)` }">
            <div 
              v-for="(line, index) in currentLyrics" 
              :key="index"
              class="lyric-line"
              :class="{ active: index === currentLyricIndex }"
              @click="seekToLyric(line.time)"
            >
              {{ line.text }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 音频元素 -->
    <audio 
      ref="audioPlayer"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onSongEnd"
      @progress="onProgress"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import { musicService } from '../api/music.js'
import { audioUtils } from '../config/audio.js'

// 响应式数据
const currentSong = ref(null)
const isPlaying = ref(false)
const isExpanded = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(80)
const isMuted = ref(false)
const playMode = ref('sequence') // sequence, single, random
const playlist = ref([])
const currentIndex = ref(-1)
const currentLyrics = ref([])
const currentLyricIndex = ref(0)
const lyricsOffset = ref(0)
const bufferProgress = ref(0)

// DOM 引用
const audioPlayer = ref(null)
const lyricsContainer = ref(null)

// 默认封面
const defaultCover = 'https://picsum.photos/200/200?default=fallback'

// 计算属性
const progressPercentage = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

const playModeIcon = computed(() => {
  const icons = {
    sequence: '🔁',
    single: '🔂',
    random: '🔀'
  }
  return icons[playMode.value]
})

const playModeTitle = computed(() => {
  const titles = {
    sequence: '列表播放',
    single: '单曲循环',
    random: '随机播放'
  }
  return titles[playMode.value]
})

const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0) return '🔇'
  if (volume.value < 30) return '🔈'
  if (volume.value < 70) return '🔉'
  return '🔊'
})

const canPrev = computed(() => {
  return playlist.value.length > 0 && currentIndex.value > 0
})

const canNext = computed(() => {
  return playlist.value.length > 0 && currentIndex.value < playlist.value.length - 1
})

// API 调用方法
const fetchTopPlaylists = async () => {
  try {
    const response = await axios.get('http://iwenwiki.com:3000/top/playlist/highquality')
    return response.data.playlists?.slice(0, 10) || []
  } catch (error) {
    console.error('获取精品歌单失败:', error)
    return []
  }
}

const fetchTopListDetail = async () => {
  try {
    const response = await axios.get('http://iwenwiki.com:3000/toplist/detail')
    return response.data.list?.slice(0, 10) || []
  } catch (error) {
    console.error('获取榜单摘要失败:', error)
    return []
  }
}

const fetchTopArtists = async () => {
  try {
    const response = await axios.get('http://iwenwiki.com:3000/toplist/artist')
    return response.data.list?.artists?.slice(0, 10) || []
  } catch (error) {
    console.error('获取歌手榜失败:', error)
    return []
  }
}

const fetchTopMV = async () => {
  try {
    const response = await axios.get('http://iwenwiki.com:3000/top/mv')
    return response.data.data?.slice(0, 10) || []
  } catch (error) {
    console.error('获取MV排行失败:', error)
    return []
  }
}

const fetchPersonalized = async () => {
  try {
    const response = await axios.get('http://iwenwiki.com:3000/personalized')
    return response.data.result?.slice(0, 10) || []
  } catch (error) {
    console.error('获取推荐歌单失败:', error)
    return []
  }
}

const fetchPersonalizedNewsong = async () => {
  try {
    const response = await axios.get('http://iwenwiki.com:3000/personalized/newsong')
    return response.data.result?.slice(0, 10) || []
  } catch (error) {
    console.error('获取推荐新音乐失败:', error)
    return []
  }
}

const fetchTopSongs = async () => {
  try {
    const response = await axios.get('http://iwenwiki.com:3000/top/song')
    return response.data.data?.slice(0, 10) || []
  } catch (error) {
    console.error('获取新歌速递失败:', error)
    return []
  }
}

// 播放控制方法
const togglePlay = async () => {
  if (!audioPlayer.value) return
  
  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  } else {
    // 如果没有当前歌曲，加载第一首
    if (!currentSong.value && playlist.value.length > 0) {
      await loadSong(0)
    }
    
    // 确保音频已加载
    if (audioPlayer.value.src && audioPlayer.value.readyState >= 2) {
      try {
        await audioPlayer.value.play()
        isPlaying.value = true
      } catch (error) {
        console.error('播放失败:', error)
      }
    } else if (audioPlayer.value.src) {
      // 音频还在加载中，等待加载完成后播放
      const playWhenReady = () => {
        if (audioPlayer.value.readyState >= 2) {
          audioPlayer.value.play()
            .then(() => {
              isPlaying.value = true
            })
            .catch(error => {
              console.error('播放失败:', error)
            })
        } else {
          setTimeout(playWhenReady, 100)
        }
      }
      playWhenReady()
    }
  }
}

const prevSong = async () => {
  if (currentIndex.value > 0) {
    const wasPlaying = isPlaying.value
    await loadSong(currentIndex.value - 1)
    if (wasPlaying) {
      play()
    }
  }
}

const nextSong = async () => {
  let nextIndex = -1
  
  if (playMode.value === 'random') {
    nextIndex = Math.floor(Math.random() * playlist.value.length)
  } else if (currentIndex.value < playlist.value.length - 1) {
    nextIndex = currentIndex.value + 1
  }
  
  if (nextIndex >= 0) {
    const wasPlaying = isPlaying.value
    await loadSong(nextIndex)
    if (wasPlaying) {
      play()
    }
  } else if (playMode.value === 'sequence' && currentIndex.value === playlist.value.length - 1) {
    // 列表播放完毕，停止播放
    pause()
  }
}

const togglePlayMode = () => {
  const modes = ['sequence', 'single', 'random']
  const currentModeIndex = modes.indexOf(playMode.value)
  playMode.value = modes[(currentModeIndex + 1) % modes.length]
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  if (audioPlayer.value) {
    audioPlayer.value.muted = isMuted.value
  }
}

const updateVolume = () => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value / 100
  }
}

const seekTo = (event) => {
  if (!audioPlayer.value || !duration.value) return
  
  const rect = event.currentTarget.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const newTime = percent * duration.value
  currentTime.value = newTime
  audioPlayer.value.currentTime = newTime
}

const seekToLyric = (time) => {
  if (audioPlayer.value) {
    currentTime.value = time
    audioPlayer.value.currentTime = time
  }
}

const play = () => {
  if (audioPlayer.value) {
    audioPlayer.value.play()
    isPlaying.value = true
  }
}

const pause = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  }
}

// 加载歌曲
const loadSong = async (index) => {
  if (index < 0 || index >= playlist.value.length) return
  
  const song = playlist.value[index]
  currentIndex.value = index
  currentSong.value = song
  
  // 保存当前播放状态
  const wasPlaying = isPlaying.value
  
  // 先暂停当前播放
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
  
  try {
    // 获取歌曲播放URL
    console.log('正在获取歌曲播放URL:', song.id)
    const urlResult = await musicService.getSongUrl(song.id)
    
    let audioUrl = ''
    if (urlResult.success && urlResult.data?.url) {
      audioUrl = audioUtils.fixAudioUrl(urlResult.data.url)
      console.log('歌曲URL设置成功:', audioUrl)
    } else {
      console.warn('获取歌曲URL失败:', urlResult.error || '未知错误')
      // 使用备用音频
      const fallbackAudio = audioUtils.getFallbackAudio()
      audioUrl = fallbackAudio.url
      console.log('使用备用音频:', fallbackAudio.url)
    }
    
    if (audioPlayer.value) {
      // 重置播放器状态
      audioPlayer.value.src = audioUrl
      currentTime.value = 0
      duration.value = 0
      bufferProgress.value = 0
      
      // 加载歌词
      loadLyrics(song.id)
      
      // 创建一个Promise来等待音频可以播放
      await new Promise((resolve, reject) => {
        audioPlayer.value.addEventListener('canplay', function onCanPlay() {
          audioPlayer.value.removeEventListener('canplay', onCanPlay)
          resolve()
        }, { once: true })
        
        audioPlayer.value.addEventListener('error', function onError() {
          audioPlayer.value.removeEventListener('error', onError)
          reject(new Error('音频加载失败'))
        }, { once: true })
        
        // 触发加载
        audioPlayer.value.load()
      })
      
      // 如果之前在播放状态，自动播放新歌
      if (wasPlaying) {
        try {
          await audioPlayer.value.play()
          isPlaying.value = true
        } catch (error) {
          console.error('自动播放失败:', error)
          isPlaying.value = false
        }
      } else {
        isPlaying.value = false
      }
    }
  } catch (error) {
    console.error('加载歌曲时发生错误:', error)
    // 使用备用音频
    const fallbackAudio = audioUtils.getFallbackAudio()
    if (audioPlayer.value) {
      audioPlayer.value.src = fallbackAudio.url
      currentTime.value = 0
      duration.value = 0
      bufferProgress.value = 0
      loadLyrics(song.id)
    }
  }
}

// 加载歌词
const loadLyrics = async (songId) => {
  try {
    // 这里应该调用歌词API，暂时使用模拟数据
    currentLyrics.value = [
      { time: 0, text: '暂无歌词显示' },
      { time: 5, text: '这是示例歌词' },
      { time: 10, text: '歌词会随时间滚动' },
      { time: 15, text: '当前歌词会高亮显示' }
    ]
    currentLyricIndex.value = 0
  } catch (error) {
    console.error('加载歌词失败:', error)
    currentLyrics.value = [{ time: 0, text: '暂无歌词' }]
  }
}

// 音频事件处理
const onTimeUpdate = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
    updateCurrentLyric()
  }
}

const onLoadedMetadata = () => {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration
  }
}

const onSongEnd = () => {
  if (playMode.value === 'single') {
    // 单曲循环
    if (audioPlayer.value) {
      audioPlayer.value.currentTime = 0
      audioPlayer.value.play()
    }
  } else {
    // 播放下一首
    nextSong()
  }
}

const onProgress = () => {
  if (audioPlayer.value && audioPlayer.value.buffered.length > 0) {
    const buffered = audioPlayer.value.buffered
    const bufferedEnd = buffered.buffered.end(buffered.length - 1)
    bufferProgress.value = (bufferedEnd / duration.value) * 100
  }
}

// 更新当前歌词
const updateCurrentLyric = () => {
  for (let i = currentLyrics.value.length - 1; i >= 0; i--) {
    if (currentTime.value >= currentLyrics.value[i].time) {
      if (currentLyricIndex.value !== i) {
        currentLyricIndex.value = i
        updateLyricsScroll()
      }
      break
    }
  }
}

// 更新歌词滚动位置
const updateLyricsScroll = () => {
  nextTick(() => {
    if (lyricsContainer.value) {
      const containerHeight = lyricsContainer.value.clientHeight
      const activeLine = lyricsContainer.value.querySelector('.lyric-line.active')
      if (activeLine) {
        const lineHeight = activeLine.offsetHeight
        const activeOffset = currentLyricIndex.value * lineHeight
        const targetOffset = (containerHeight / 2) - (lineHeight / 2) - activeOffset
        lyricsOffset.value = targetOffset
      }
    }
  })
}

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '00:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 搜索功能
const searchSongs = async (query) => {
  try {
    const response = await axios.get(`http://iwenwiki.com:3000/search?keywords=${encodeURIComponent(query)}`)
    return response.data.result?.songs || []
  } catch (error) {
    console.error('搜索失败:', error)
    return []
  }
}

// 初始化数据
const initializeData = async () => {
  try {
    // 并发调用多个API
    const [
      playlists,
      topLists,
      artists,
      mvs,
      personalized,
      newsongs,
      topsongs
    ] = await Promise.all([
      fetchTopPlaylists(),
      fetchTopListDetail(),
      fetchTopArtists(),
      fetchTopMV(),
      fetchPersonalized(),
      fetchPersonalizedNewsong(),
      fetchTopSongs()
    ])
    
    // 将API数据转换为播放列表格式（不需要设置url，会在loadSong时动态获取）
    const songs = [
      ...newsongs.map(item => ({
        id: item.id,
        title: item.name,
        artist: item.song?.artists?.[0]?.name || '未知',
        cover: item.song?.album?.picUrl || defaultCover,
        album: item.song?.album?.name || '未知专辑',
        duration: item.song?.duration || 0,
        url: '' // url将在播放时动态获取
      })),
      ...topsongs.map(item => ({
        id: item.id,
        title: item.name,
        artist: item.ar?.[0]?.name || '未知',
        cover: item.al?.picUrl || defaultCover,
        album: item.al?.name || '未知专辑',
        duration: item.dt || 0,
        url: '' // url将在播放时动态获取
      }))
    ].slice(0, 20) // 限制20首歌曲
    
    playlist.value = songs
    console.log('音乐数据加载完成:', songs.length, '首歌曲')
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
}

// 生命周期
onMounted(() => {
  initializeData()
  
  // 设置音频元素事件
  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value / 100
    audioPlayer.value.muted = isMuted.value
  }
})

onUnmounted(() => {
  // 清理音频播放器
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value = null
  }
})

// 暴露方法给父组件
defineExpose({
  playSong: (song) => {
    const songIndex = playlist.value.findIndex(s => s.id === song.id)
    if (songIndex === -1) {
      // 如果歌曲不在播放列表中，添加到列表
      playlist.value.push(song)
      loadSong(playlist.value.length - 1)
    } else {
      loadSong(songIndex)
    }
    play()
  },
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
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: var(--z-index-player);
  transition: all var(--transition-normal) var(--ease-out);
}

.music-player.expanded {
  top: 0;
  background: var(--color-bg-primary);
}

/* 播放器主体 */
.player-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
  height: 80px;
}

/* 歌曲信息 */
.track-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.album-cover {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-cover.rotating img {
  animation: rotate 20s linear infinite;
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
  transition: opacity var(--transition-normal) var(--ease-out);
}

.album-cover:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  color: var(--color-text-inverse);
  font-size: var(--font-size-lg);
}

.track-details {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 播放控制 */
.player-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.control-btn {
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast) var(--ease-out);
}

.control-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-primary);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-pause-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xl);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out);
}

.play-pause-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.1);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-border);
  border-radius: var(--radius-round);
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
}

/* 进度条 */
.progress-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  max-width: 300px;
}

.time-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  min-width: 40px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-round);
  position: relative;
  cursor: pointer;
}

.progress-buffer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--color-bg-tertiary);
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
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.progress-thumb:hover {
  transform: translate(-50%, -50%) scale(1.2);
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