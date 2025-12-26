import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://iwenwiki.com:3000',
  timeout: 10000,
  withCredentials: true, // 支持跨域携带cookie
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    // 添加User-Agent模拟真实浏览器
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    // 添加Referer
    'Referer': 'https://music.163.com/',
    // 添加Accept
    'Accept': '*/*',
    // 添加Accept-Language
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('API请求:', config.method?.toUpperCase(), config.url)
    
    // 添加时间戳参数避免缓存（特别是POST请求）
    if (!config.params) {
      config.params = {}
    }
    
    // 使用不同的随机IP避免风控
    const domesticIPs = [
      '116.25.146.177',
      '121.29.38.126',
      '113.87.22.191',
      '113.88.236.242',
      '120.79.147.208',
      '119.29.242.86'
    ]
    const randomIP = domesticIPs[Math.floor(Math.random() * domesticIPs.length)]
    
    config.params.timestamp = Date.now()
    config.params.realIP = randomIP
    
    // 添加设备ID模拟真实设备
    if (!config.params.e_r) {
      config.params.e_r = true
    }
    
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
      console.log('Cookie已更新')
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
    let errorMessage = error.message || '请求失败'
    
    if (errorData) {
      // 处理特定的错误码
      if (errorData.code === 460) {
        errorMessage = '设备存在安全风险，已自动使用IP重试'
        console.error('460错误:', errorData)
      } else if (errorData.code === 503) {
        errorMessage = '请求频率过高，请稍后再试'
      } else if (errorData.message) {
        errorMessage = errorData.message
      }
    }
    
    return Promise.reject(new Error(errorMessage))
  }
)

// 重试机制
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      console.log(`请求失败，剩余重试次数: ${retries}, ${delay}ms后重试`)
      await new Promise(resolve => setTimeout(resolve, delay))
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

  // 11. 获取歌词
  getLyrics(songId) {
    return retryRequest(() => api.get(`/lyric?id=${songId}`))
  },

  // 12. 获取逐字歌词
  getNewLyrics(songId) {
    return retryRequest(() => api.get(`/lyric/new?id=${songId}`))
  },

  // 登录相关接口
  
  // 13. 发送验证码 - 添加随机延迟规避风控
  async sendCaptcha(phone, ctcode = '86') {
    // 添加随机延迟（1-2秒）避免频繁调用
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    
    // 发送验证码不使用重试机制
    return api.get(`/captcha/sent?phone=${phone}&ctcode=${ctcode}`)
  },

  // 14. 手机号验证码登录 - 使用POST请求，添加随机延迟规避风控
  async loginWithCaptcha(phone, captcha, ctcode = '86') {
    // 添加随机延迟（1-3秒）避免频繁调用
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    const formData = new URLSearchParams()
    formData.append('phone', phone)
    formData.append('captcha', captcha)
    formData.append('ctcode', ctcode)
    
    // 登录接口不使用重试机制，避免多次尝试触发风控
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

  // 17. 检查二维码扫码状态 - 添加参数避免风控，不使用重试
  checkQrStatus(key) {
    return api.get(`/login/qr/check?key=${key}`, {
      // 检查扫码状态不携带cookie，避免触发风控
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

  // 20. 退出登录 - 使用POST请求
  logout() {
    return retryRequest(() => api.post('/logout', new URLSearchParams()))
  },

  // 21. 游客登录 - 获取匿名cookie
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
  }
}

// 导出默认实例
export default api