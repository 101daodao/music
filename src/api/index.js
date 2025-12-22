import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://iwenwiki.com:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('API请求:', config.method?.toUpperCase(), config.url)
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
    return response.data
  },
  error => {
    console.error('响应错误:', error)
    const errorMessage = error.response?.data?.message || error.message || '请求失败'
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
  }
}

// 导出默认实例
export default api