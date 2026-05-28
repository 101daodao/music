import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // 支持跨域携带cookie
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': '*/*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
  }
})

// 请求拦截器
api.interceptors.request.use(
  async config => {
    // 添加时间戳参数避免缓存
    if (!config.params) {
      config.params = {}
    }
    
    config.params.timestamp = Date.now()
    
    // 从本地存储获取cookie
    const cookie = localStorage.getItem('netease-cookie')
    if (cookie && !config.params.noCookie) {
      // 将cookie添加到请求
      if (config.method === 'get') {
        // GET请求通过params传递cookie
        config.params.cookie = encodeURIComponent(cookie)
      } else {
        // POST请求通过body传递cookie
        if (config.headers['Content-Type'].includes('application/json')) {
          if (!config.data) {
            config.data = {}
          }
          config.data.cookie = cookie
        } else if (config.headers['Content-Type'].includes('application/x-www-form-urlencoded')) {
          if (!config.data) {
            config.data = ''
          }
          // 对于表单格式，需要将cookie添加到现有数据中
          if (typeof config.data === 'string') {
            config.data += `&cookie=${encodeURIComponent(cookie)}`
          } else {
            config.data = `cookie=${encodeURIComponent(cookie)}`
          }
        }
      }
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const data = response.data
    
    // 检查是否返回了新的cookie
    if (data.cookie) {
      // 更新本地存储的cookie
      localStorage.setItem('netease-cookie', data.cookie)
    }
    
    // 处理设备安全风险等特定错误
    if (data.code === 460) {
      console.warn('设备安全风险检测，已使用realIP参数重试')
    }
    
    return data
  },
  async error => {
    console.error('响应错误:', error)
    
    // 检查响应数据
    const errorData = error.response?.data
    const status = error.response?.status
    let errorMessage = error.message || '请求失败'
    
    if (errorData) {
      // 处理特定的错误码
      if (errorData.code === 460) {
        errorMessage = '设备存在安全风险，已自动使用IP重试'
        console.error('460错误:', errorData)
      } else if (errorData.code === 503) {
        errorMessage = '请求频率过高，请稍后再试'
        // 建议用户等待片刻再试
        await new Promise(resolve => setTimeout(resolve, 3000))
      } else if (errorData.code === 403 || errorData.code === 401) {
        errorMessage = '请求被拒绝，可能是触发风控，请稍后再试'
        console.error('风控拦截:', errorData)
      } else if (errorData.message) {
        errorMessage = errorData.message
      }
    }
    
    // 处理HTTP状态码
    if (status === 403) {
      errorMessage = '请求频率过高，已被限流，请稍后再试'
      // 强制等待时间
      await new Promise(resolve => setTimeout(resolve, 5000))
    } else if (status === 429) {
      errorMessage = '请求过于频繁，请稍后再试'
    } else if (status >= 500) {
      errorMessage = '服务暂时不可用，请稍后再试'
    }
    
    return Promise.reject(new Error(errorMessage))
  }
)

// 重试机制 - 减少重试次数和延迟时间以提高响应速度
const retryRequest = async (fn, retries = 1, delay = 500) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      return retryRequest(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

// API接口封装
export const musicApi = {
  // 1. 获取精品歌单
  getHighQualityPlaylists() {
    return retryRequest(() => api.get('/top/playlist/highquality'))
  },

  // 2. 获取所有榜单内容摘要
  getToplistDetail() {
    return retryRequest(() => api.get('/toplist/detail'))
  },

  // 3. 获取所有榜单列表
  getToplist() {
    return retryRequest(() => api.get('/toplist'))
  },

  // 4. 获取歌单/榜单详情
  getPlaylistDetail(id) {
    return retryRequest(() => api.get(`/playlist/detail?id=${id}`))
  },

  // 3. 获取歌手榜
  getArtistToplist() {
    return retryRequest(() => api.get('/toplist/artist'))
  },

  // 4. 获取MV排行
  getMvToplist() {
    return retryRequest(() => api.get('/top/mv'))
  },

  // 5. 获取推荐歌单
  getPersonalizedPlaylists() {
    return retryRequest(() => api.get('/personalized'))
  },

  // 6. 获取推荐新音乐
  getPersonalizedNewSongs() {
    return retryRequest(() => api.get('/personalized/newsong'))
  },

  // 7. 获取新歌速递
  getTopSongs() {
    return retryRequest(() => api.get('/top/song'))
  },

  // 8. 获取歌曲播放URL
  getSongUrl(songId, level = 'standard') {
    return retryRequest(() => api.get(`/song/url/v1?id=${songId}&level=${level}`))
  },

  // 9. 批量获取歌曲播放URL
  getBatchSongUrls(songIds, level = 'standard') {
    const ids = Array.isArray(songIds) ? songIds.join(',') : songIds
    return retryRequest(() => api.get(`/song/url/v1?id=${ids}&level=${level}`))
  },

  // 10. 搜索音乐
  searchMusic(keyword, limit = 20) {
    return retryRequest(() => api.get(`/search?keywords=${encodeURIComponent(keyword)}&limit=${limit}`))
  },

  // 多类型搜索
  // type: 1-单曲, 10-专辑, 100-歌手, 1000-歌单, 1002-用户, 1004-MV, 1006-歌词, 1009-电台, 1014-视频
  search(keyword, type = 1, limit = 20, offset = 0) {
    return retryRequest(() => api.get(`/search?keywords=${encodeURIComponent(keyword)}&type=${type}&limit=${limit}&offset=${offset}`))
  },

  // 搜索单曲
  searchSongs(keyword, limit = 20, offset = 0) {
    return retryRequest(() => api.get(`/search?keywords=${encodeURIComponent(keyword)}&type=1&limit=${limit}&offset=${offset}`))
  },

  // 搜案歌单
  searchPlaylists(keyword, limit = 20, offset = 0) {
    return retryRequest(() => api.get(`/search?keywords=${encodeURIComponent(keyword)}&type=1000&limit=${limit}&offset=${offset}`))
  },

  // 11. 获取歌词
  getLyrics(songId) {
    return retryRequest(() => api.get(`/lyric?id=${songId}`))
  },

  // 12. 获取逐字歌词
  getNewLyrics(songId) {
    return retryRequest(() => api.get(`/lyric/new?id=${songId}`))
  },

  // 登录相关接口
  
  // 13. 发送验证码
  async sendCaptcha(phone, ctcode = '86') {
    return api.get(`/captcha/sent?phone=${phone}&ctcode=${ctcode}`)
  },

  // 14. 手机号验证码登录
  async loginWithCaptcha(phone, captcha, ctcode = '86') {
    const formData = new URLSearchParams()
    formData.append('phone', phone)
    formData.append('captcha', captcha)
    formData.append('ctcode', ctcode)
    
    return api.post('/login/cellphone', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },

  // 15. 生成二维码key
  getQrKey() {
    return retryRequest(() => api.get('/login/qr/key'))
  },

  // 16. 生成二维码
  createQrCode(key, qrimg = true) {
    return retryRequest(() => api.get(`/login/qr/create?key=${key}&qrimg=${qrimg}`))
  },

  // 17. 检查二维码扫码状态
  checkQrStatus(key) {
    return api.get(`/login/qr/check?key=${key}`, {
      params: {
        noCookie: true
      }
    })
  },

  // 18. 获取用户信息
  getUserAccount() {
    return retryRequest(() => api.get('/user/account'))
  },

  // 19. 获取用户详情（包含头像）
  getUserDetail(uid) {
    return retryRequest(() => api.get(`/user/detail?uid=${uid}`))
  },

  // 20. 退出登录
  logout() {
    return retryRequest(() => api.post('/logout', new URLSearchParams()))
  },

  // 21. 游客登录
  getAnonimousUser() {
    return api.post('/register/anonimous', new URLSearchParams())
  },

  // 22. 获取歌手全部歌曲
  getArtistSongs(id, options = {}) {
    const { order = 'hot', limit = 50, offset = 0 } = options
    return retryRequest(() =>
      api.get(`/artist/songs?id=${id}&order=${order}&limit=${limit}&offset=${offset}`)
    )
  },

  // 23. 获取歌曲详情
  getSongDetail(ids) {
    const songIds = Array.isArray(ids) ? ids.join(',') : ids
    return retryRequest(() => api.get(`/song/detail?ids=${songIds}`))
  },

  // 24. 获取用户歌单
  getUserPlaylists(uid, limit = 30, offset = 0) {
    return retryRequest(() => api.get(`/user/playlist?uid=${uid}&limit=${limit}&offset=${offset}`))
  },

  // 25. 获取用户喜欢的歌曲ID列表
  getLikedSongs(uid) {
    return retryRequest(() => api.get(`/likelist?uid=${uid}`))
  },

  // 26. 获取推荐MV
  getPersonalizedMV(limit = 10) {
    return retryRequest(() => api.get(`/personalized/mv`, { params: { limit } }))
  },

  // 27. 获取MV详情
  getMVDetail(mvid) {
    return retryRequest(() => api.get(`/mv/detail?mvid=${mvid}`))
  },

  // 28. 获取MV播放地址
  getMVUrl(id, r = 1080) {
    return retryRequest(() => api.get(`/mv/url?id=${id}&r=${r}`))
  },

  // 29. 获取网易出品MV
  getExclusiveMV(options = {}) {
    const { limit = 30, offset = 0 } = options
    return retryRequest(() => api.get(`/mv/exclusive/rcmd?limit=${limit}&offset=${offset}`))
  }
}

// 导出默认实例
export default api