import { musicApi } from './index.js'

// 音乐数据转换工具
export const formatMusicData = {
  // 格式化歌单数据
  formatPlaylist(data) {
    return {
      id: data.id,
      name: data.name,
      coverImgUrl: data.coverImgUrl,
      playCount: data.playCount,
      trackCount: data.trackCount,
      description: data.description || '',
      creator: data.creator?.nickname || '未知用户',
      createTime: data.createTime,
      tags: data.tags || []
    }
  },

  // 格式化歌曲数据
  formatSong(data) {
    return {
      id: data.id,
      name: data.name || data.song?.name || '未知歌曲',
      artist: data.artist || data.song?.artists?.[0]?.name || data.ar?.[0]?.name || '未知歌手',
      album: data.album || data.song?.album?.name || data.al?.name || '未知专辑',
      duration: data.duration || data.song?.duration || 0,
      coverUrl: data.picUrl || data.song?.album?.picUrl || data.al?.picUrl || '',
      url: data.url || ''
    }
  },

  // 格式化歌手数据
  formatArtist(data) {
    return {
      id: data.id,
      name: data.name,
      picUrl: data.picUrl || data.img1v1Url,
      fansCount: data.fansCount || 0,
      albumSize: data.albumSize || 0,
      musicSize: data.musicSize || 0
    }
  },

  // 格式化MV数据
  formatMV(data) {
    return {
      id: data.id,
      name: data.name,
      artistName: data.artistName || data.artist?.name,
      coverUrl: data.cover || data.imgurl,
      playCount: data.playCount || 0,
      duration: data.duration || 0
    }
  },

  // 格式化轮播图数据（用于推荐新音乐）
  formatCarousel(item) {
    return {
      id: item.id,
      title: item.name || item.song?.name || '未知歌曲',
      artist: item.artist || item.song?.artists?.[0]?.name || item.ar?.[0]?.name || '未知歌手',
      cover: item.picUrl || item.song?.album?.picUrl || item.al?.picUrl || '',
      album: item.album || item.song?.album?.name || item.al?.name || '未知专辑',
      duration: item.duration || item.song?.duration || 0
    }
  }
}

// 格式化播放量
export const formatPlayCount = (count) => {
  if (!count) return '0'
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿'
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

// 音乐数据服务
export const musicService = {
  // 获取所有榜单列表
  async getToplist() {
    try {
      const response = await musicApi.getToplist()
      return {
        success: true,
        data: response.list || [],
        total: response.list?.length || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 获取歌单/榜单详情
  async getPlaylistDetail(id) {
    try {
      const response = await musicApi.getPlaylistDetail(id)
      const playlist = response.playlist
      
      // 格式化歌曲列表
      const songs = playlist?.tracks?.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.ar?.map(a => a.name).join(' / ') || track.artists?.map(a => a.name).join(' / ') || '未知歌手',
        album: track.al?.name || track.album?.name || '未知专辑',
        duration: track.dt || track.duration || 0,
        coverUrl: track.al?.picUrl || track.album?.picUrl || '',
        mv: track.mv || 0
      })) || []

      return {
        success: true,
        data: {
          id: playlist?.id,
          name: playlist?.name,
          coverImgUrl: playlist?.coverImgUrl,
          description: playlist?.description || '',
          playCount: playlist?.playCount || 0,
          trackCount: playlist?.trackCount || tracks?.length || 0,
          creator: playlist?.creator?.nickname || '网易云音乐',
          tags: playlist?.tags || [],
          updateTime: playlist?.updateTime || 0,
          songs: songs
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },

  // 获取精品歌单
  async getHighQualityPlaylists(limit = 10) {
    try {
      const response = await musicApi.getHighQualityPlaylists()
      return {
        success: true,
        data: response.playlists?.slice(0, limit).map(formatMusicData.formatPlaylist) || [],
        total: response.total || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 获取榜单详情
  async getToplistDetail() {
    try {
      const response = await musicApi.getToplistDetail()
      return {
        success: true,
        data: response.list || []
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 获取轮播图数据（推荐新音乐）
  async getCarouselData(limit = 10) {
    try {
      const response = await musicApi.getPersonalizedNewSongs()
      const carousels = response.result?.slice(0, limit).map(formatMusicData.formatCarousel) || []
      
      return {
        success: true,
        data: carousels,
        total: carousels.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 获取歌手榜
  async getArtistToplist() {
    try {
      const response = await musicApi.getArtistToplist()
      return {
        success: true,
        data: response.list?.artists?.map(formatMusicData.formatArtist) || [],
        updateTime: response.list?.updateTime || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 获取MV排行
  async getMvToplist(limit = 20) {
    try {
      const response = await musicApi.getMvToplist()
      return {
        success: true,
        data: response.data?.slice(0, limit).map(formatMusicData.formatMV) || []
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 获取推荐歌单
  async getPersonalizedPlaylists(limit = 10) {
    try {
      const response = await musicApi.getPersonalizedPlaylists()
      return {
        success: true,
        data: response.result?.slice(0, limit).map(formatMusicData.formatPlaylist) || []
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 获取推荐新音乐
  async getPersonalizedNewSongs(limit = 10) {
    try {
      const response = await musicApi.getPersonalizedNewSongs()
      return {
        success: true,
        data: response.result?.slice(0, limit).map(item => formatMusicData.formatSong(item)) || []
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 获取新歌速递
  async getTopSongs() {
    try {
      const response = await musicApi.getTopSongs()
      return {
        success: true,
        data: response.data?.map(formatMusicData.formatSong) || []
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 获取歌曲播放URL
  async getSongUrl(songId, level = 'standard') {
    try {
      const response = await musicApi.getSongUrl(songId, level)
      const urlData = response.data?.[0]
      
      if (!urlData || !urlData.url) {
        return {
          success: false,
          error: '无法获取歌曲播放链接',
          data: null
        }
      }

      return {
        success: true,
        data: {
          id: urlData.id,
          url: urlData.url,
          br: urlData.br,
          size: urlData.size,
          md5: urlData.md5,
          level: urlData.level || level
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },

  // 批量获取歌曲播放URL
  async getBatchSongUrls(songIds, level = 'standard') {
    try {
      const response = await musicApi.getBatchSongUrls(songIds, level)
      const urls = response.data || []
      
      return {
        success: true,
        data: urls.map(item => ({
          id: item.id,
          url: item.url,
          br: item.br,
          size: item.size,
          md5: item.md5,
          level: item.level || level
        }))
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 搜索音乐
  async searchMusic(keyword, limit = 20) {
    try {
      const response = await musicApi.searchMusic(keyword, limit)
      const songs = response.result?.songs || []
      
      return {
        success: true,
        data: songs.map(item => formatMusicData.formatSong(item)),
        total: response.result?.songCount || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 获取歌词
  async getLyrics(songId) {
    try {
      const response = await musicApi.getLyrics(songId)
      
      if (!response.lrc) {
        return {
          success: false,
          error: '该歌曲暂无歌词',
          data: null
        }
      }

      // 解析歌词格式 [时间戳]歌词内容
      const lyricsText = response.lrc.lyric || ''
      const lyrics = this.parseLyrics(lyricsText)
      
      return {
        success: true,
        data: {
          lyrics,
          hasTranslation: !!response.tlyric?.lyric,
          translation: response.tlyric?.lyric || '',
          hasYrc: !!response.yrc?.lyric,
          yrc: response.yrc?.lyric || ''
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },

  // 获取逐字歌词
  async getNewLyrics(songId) {
    try {
      const response = await musicApi.getNewLyrics(songId)
      
      if (!response.yrc?.lyric) {
        return {
          success: false,
          error: '该歌曲暂无逐字歌词',
          data: null
        }
      }

      const yrcLyrics = response.yrc.lyric
      const lyrics = this.parseYrcLyrics(yrcLyrics)
      
      return {
        success: true,
        data: {
          lyrics,
          version: response.yrc?.version || 1,
          hasTranslation: !!response.yrc?.tran,
          translation: response.yrc?.tran || ''
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },

  // 解析普通歌词格式
  parseLyrics(lyricsText) {
    if (!lyricsText) return []
    
    const lines = lyricsText.split('\n')
    const lyrics = []
    
    for (const line of lines) {
      // 匹配时间戳格式 [mm:ss.xxx] 或 [mm:ss]
      const timeMatch = line.match(/^\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/)
      
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1])
        const seconds = parseInt(timeMatch[2])
        const milliseconds = timeMatch[3] ? parseInt(timeMatch[3].padEnd(3, '0')) : 0
        
        const time = minutes * 60 + seconds + milliseconds / 1000
        const text = line.replace(/^\[\d{2}:\d{2}(?:\.\d{2,3})?\]/, '').trim()
        
        if (text) {
          lyrics.push({ time, text })
        }
      }
    }
    
    return lyrics.sort((a, b) => a.time - b.time)
  },

  // 解析逐字歌词格式
  parseYrcLyrics(yrcText) {
    if (!yrcText) return []
    
    const lyrics = []
    const lines = yrcText.split('\n')
    
    for (const line of lines) {
      // 匹配JSON格式的歌词元数据
      if (line.startsWith('{') && line.endsWith('}')) {
        // 跳过元数据行
        continue
      }
      
      // 匹配逐字歌词格式 [开始时间,持续时间](逐字时间戳...)
      const match = line.match(/^\[(\d+),(\d+)\](.+)$/)
      if (match) {
        const startTime = parseInt(match[1]) / 1000 // 转换为秒
        const duration = parseInt(match[2]) / 1000
        const content = match[3]
        
        // 简化处理，提取纯文本
        const text = content.replace(/\(\d+,\d+,\d+\)/g, '').trim()
        
        if (text) {
          lyrics.push({
            time: startTime,
            text,
            duration,
            originalLine: line
          })
        }
      }
    }
    
    return lyrics.sort((a, b) => a.time - b.time)
  },

  // 获取歌手全部歌曲
  async getArtistSongs(artistId, options = {}) {
    const { order = 'hot', limit = 50, offset = 0 } = options
    try {
      const response = await musicApi.getArtistSongs(artistId, { order, limit, offset })
      const songs = response.songs || []
      
      // 获取所有歌曲ID
      const songIds = songs.map(item => item.id).join(',')
      
      // 批量获取歌曲详情以获取正确的图片URL
      let detailResponse
      try {
        detailResponse = await musicApi.getSongDetail(songIds)
      } catch (detailError) {
        console.warn('获取歌曲详情失败:', detailError)
      }
      
      // 创建歌曲详情映射
      const detailMap = {}
      if (detailResponse?.songs) {
        detailResponse.songs.forEach(song => {
          detailMap[song.id] = song
        })
      }
      
      return {
        success: true,
        data: songs.map(item => {
          const detail = detailMap[item.id]
          // 优先使用歌曲详情中的图片URL
          let coverUrl = detail?.al?.picUrl || ''
          
          return {
            id: item.id,
            title: item.name || '未知歌曲',
            artist: item.ar?.[0]?.name || '未知歌手',
            album: item.al?.name || '未知专辑',
            cover: coverUrl,
            duration: item.duration || 0
          }
        }),
        total: response.total || 0,
        more: response.more || false
      }
    } catch (error) {
      console.error('获取歌手歌曲失败:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // 获取歌曲详情（单个）
  async getSongDetail(songId) {
    try {
      const response = await musicApi.getSongDetail(songId)
      
      if (!response.songs || response.songs.length === 0) {
        return {
          success: false,
          error: '歌曲不存在',
          data: null
        }
      }

      const song = response.songs[0]
      return {
        success: true,
        data: {
          id: song.id,
          name: song.name,
          artist: song.ar?.[0]?.name || '未知歌手',
          album: song.al?.name || '未知专辑',
          picUrl: song.al?.picUrl || '',
          duration: song.duration || 0
        }
      }
    } catch (error) {
      console.error('获取歌曲详情失败:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }
}