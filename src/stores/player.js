import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { musicService } from '../api/music.js'
import { audioUtils } from '../config/audio.js'

export const usePlayerStore = defineStore('player', () => {
  // 播放状态
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const isExpanded = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(80)
  const isMuted = ref(false)
  const bufferProgress = ref(0)

  // 播放列表
  const playlist = ref([])
  const currentIndex = ref(-1)
  const playMode = ref('sequence') // sequence, single, random

  // 歌词
  const currentLyrics = ref([])
  const currentLyricIndex = ref(0)
  const lyricsOffset = ref(0)

  // 音频元素引用
  const audioElement = ref(null)

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
    return playlist.value.length > 0
  })

  // 播放控制方法
  const initAudio = (audio) => {
    audioElement.value = audio
    if (audio) {
      audio.volume = volume.value / 100
      audio.muted = isMuted.value
      
      // 绑定音频事件
      audio.addEventListener('timeupdate', onTimeUpdate)
      audio.addEventListener('loadedmetadata', onLoadedMetadata)
      audio.addEventListener('ended', onSongEnd)
      audio.addEventListener('progress', onProgress)
    }
  }

  const togglePlay = async () => {
    if (!audioElement.value) return

    if (isPlaying.value) {
      audioElement.value.pause()
      isPlaying.value = false
    } else {
      // 如果没有当前歌曲，加载第一首
      if (!currentSong.value && playlist.value.length > 0) {
        await loadSong(0)
      }

      try {
        await audioElement.value.play()
        isPlaying.value = true
      } catch (error) {
        console.error('播放失败:', error)
      }
    }
  }

  const play = async () => {
    if (audioElement.value) {
      try {
        await audioElement.value.play()
        isPlaying.value = true
      } catch (error) {
        console.error('播放失败:', error)
      }
    }
  }

  const pause = () => {
    if (audioElement.value) {
      audioElement.value.pause()
      isPlaying.value = false
    }
  }

  const prevSong = async () => {
    let prevIndex = -1
    
    if (playMode.value === 'random') {
      prevIndex = Math.floor(Math.random() * playlist.value.length)
    } else if (currentIndex.value > 0) {
      prevIndex = currentIndex.value - 1
    } else if (playMode.value === 'sequence') {
      prevIndex = playlist.value.length - 1  // 循环到最后一首
    }

    if (prevIndex >= 0) {
      const wasPlaying = isPlaying.value
      await loadSong(prevIndex)
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
    } else if (playMode.value === 'sequence') {
      nextIndex = 0  // 循环到第一首
    }

    if (nextIndex >= 0) {
      const wasPlaying = isPlaying.value
      await loadSong(nextIndex)
      if (wasPlaying) {
        play()
      }
    } else {
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
    if (audioElement.value) {
      audioElement.value.muted = isMuted.value
    }
  }

  const updateVolume = () => {
    if (audioElement.value) {
      audioElement.value.volume = volume.value / 100
    }
  }

  const seekTo = (event) => {
    if (!audioElement.value || !duration.value) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const percent = (event.clientX - rect.left) / rect.width
    const newTime = percent * duration.value
    currentTime.value = newTime
    audioElement.value.currentTime = newTime
  }

  const seekToLyric = (time) => {
    if (audioElement.value) {
      currentTime.value = time
      audioElement.value.currentTime = time
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
    if (audioElement.value) {
      audioElement.value.pause()
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
      
      if (audioElement.value) {
        // 重置播放器状态
        audioElement.value.src = audioUrl
        currentTime.value = 0
        duration.value = 0
        bufferProgress.value = 0
        
        // 加载歌词
        loadLyrics(song.id)
        
        // 触发加载
        audioElement.value.load()
      }
    } catch (error) {
      console.error('加载歌曲时发生错误:', error)
      // 使用备用音频
      const fallbackAudio = audioUtils.getFallbackAudio()
      if (audioElement.value) {
        audioElement.value.src = fallbackAudio.url
        currentTime.value = 0
        duration.value = 0
        bufferProgress.value = 0
        loadLyrics(song.id)
      }
    }
  }

  // 播放特定歌曲
  const playSong = async (song) => {
    const songIndex = playlist.value.findIndex(s => s.id === song.id)
    if (songIndex === -1) {
      // 如果歌曲不在播放列表中，添加到列表
      playlist.value.push(song)
      await loadSong(playlist.value.length - 1)
    } else {
      await loadSong(songIndex)
    }
    play()
  }

  // 设置播放列表
  const setPlaylist = (songs) => {
    playlist.value = songs
    if (currentIndex.value >= playlist.value.length) {
      currentIndex.value = -1
      currentSong.value = null
    }
  }

  // 清空播放列表
  const clearPlaylist = () => {
    playlist.value = []
    currentIndex.value = -1
    currentSong.value = null
    pause()
    if (audioElement.value) {
      audioElement.value.src = ''
    }
  }

  // 音频事件处理
  const onTimeUpdate = () => {
    if (audioElement.value) {
      currentTime.value = audioElement.value.currentTime
      updateCurrentLyric()
    }
  }

  const onLoadedMetadata = () => {
    if (audioElement.value) {
      duration.value = audioElement.value.duration
    }
  }

  const onSongEnd = () => {
    if (playMode.value === 'single') {
      // 单曲循环
      if (audioElement.value) {
        audioElement.value.currentTime = 0
        audioElement.value.play()
      }
    } else {
      // 播放下一首
      nextSong()
    }
  }

  const onProgress = () => {
    if (audioElement.value && audioElement.value.buffered.length > 0) {
      const buffered = audioElement.value.buffered
      const bufferedEnd = buffered.end(buffered.length - 1)
      bufferProgress.value = (bufferedEnd / duration.value) * 100
    }
  }

  // 歌词相关方法
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

  const updateCurrentLyric = () => {
    for (let i = currentLyrics.value.length - 1; i >= 0; i--) {
      if (currentTime.value >= currentLyrics.value[i].time) {
        if (currentLyricIndex.value !== i) {
          currentLyricIndex.value = i
          // 这里可以添加歌词滚动逻辑
        }
        break
      }
    }
  }

  // 工具方法
  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return '00:00'
    
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 搜索功能
  const searchSongs = async (query, limit = 20) => {
    try {
      return await musicService.searchMusic(query, limit)
    } catch (error) {
      console.error('搜索失败:', error)
      return { success: false, error: error.message, data: [] }
    }
  }

  return {
    // 状态
    currentSong,
    isPlaying,
    isExpanded,
    currentTime,
    duration,
    volume,
    isMuted,
    bufferProgress,
    playlist,
    currentIndex,
    playMode,
    currentLyrics,
    currentLyricIndex,
    lyricsOffset,
    audioElement,
    
    // 计算属性
    progressPercentage,
    playModeIcon,
    playModeTitle,
    volumeIcon,
    canPrev,
    canNext,
    
    // 方法
    initAudio,
    togglePlay,
    play,
    pause,
    prevSong,
    nextSong,
    togglePlayMode,
    toggleMute,
    updateVolume,
    seekTo,
    seekToLyric,
    loadSong,
    playSong,
    setPlaylist,
    clearPlaylist,
    loadLyrics,
    updateCurrentLyric,
    formatTime,
    searchSongs,
    
    // 音频事件
    onTimeUpdate,
    onLoadedMetadata,
    onSongEnd,
    onProgress
  }
})