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
  }
}

// 音乐数据服务
export const musicService = {
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
  }
}