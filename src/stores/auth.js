import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { musicApi } from '../api/index.js'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const isLoggedIn = ref(false)
  const userInfo = ref(null)
  const userDetail = ref(null)
  const token = ref(null)
  const cookie = ref(null)

  // 计算属性
  const avatar = computed(() => {
    if (userDetail.value?.profile?.avatarUrl) {
      return userDetail.value.profile.avatarUrl
    }
    return null
  })

  const nickname = computed(() => {
    if (userDetail.value?.profile?.nickname) {
      return userDetail.value.profile.nickname
    }
    return '未登录'
  })

  const userId = computed(() => {
    return userInfo.value?.account?.id || null
  })

  // 初始化登录状态
  const initAuthState = () => {
    try {
      const savedCookie = localStorage.getItem('netease-cookie')
      if (savedCookie) {
        cookie.value = savedCookie
        isLoggedIn.value = true
        // 尝试获取用户信息
        fetchUserInfo()
      }
    } catch (error) {
      console.error('初始化登录状态失败:', error)
    }
  }

  // 手机号验证码登录
  const loginWithCaptcha = async (phone, captcha, ctcode = '86') => {
    try {
      const response = await musicApi.loginWithCaptcha(phone, captcha, ctcode)
      
      if (response.code === 200) {
        // 登录成功
        token.value = response.token
        if (response.cookie) {
          cookie.value = response.cookie
          localStorage.setItem('netease-cookie', response.cookie)
        }
        isLoggedIn.value = true
        await fetchUserInfo()
        return { success: true, message: '登录成功' }
      } else {
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, message: error.message || '登录失败，请稍后重试' }
    }
  }

  // 二维码登录
  const loginWithQrCode = async (qrCheckInterval = 3000) => {
    try {
      // 1. 生成二维码key
      const keyResponse = await musicApi.getQrKey()
      if (keyResponse.code !== 200) {
        return { success: false, message: '生成二维码失败' }
      }
      
      const qrKey = keyResponse.data.unikey

      // 2. 创建二维码
      const qrCreateResponse = await musicApi.createQrCode(qrKey, true)
      if (qrCreateResponse.code !== 200) {
        return { success: false, message: '创建二维码失败' }
      }

      const qrCodeData = qrCreateResponse.data

      // 3. 轮询检查扫码状态
      const checkQrStatus = () => {
        return new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            try {
              const checkResponse = await musicApi.checkQrStatus(qrKey)
              
              // 801: 等待扫码, 802: 待确认, 803: 授权登录成功, 800: 二维码过期
              if (checkResponse.code === 800) {
                clearInterval(interval)
                resolve({ success: false, message: '二维码已过期，请重新获取' })
              } else if (checkResponse.code === 803) {
                clearInterval(interval)
                // 登录成功
                token.value = checkResponse.token
                if (checkResponse.cookie) {
                  cookie.value = checkResponse.cookie
                  localStorage.setItem('netease-cookie', checkResponse.cookie)
                }
                isLoggedIn.value = true
                await fetchUserInfo()
                resolve({ success: true, message: '登录成功' })
              }
              // 801 和 802 继续等待
            } catch (error) {
              clearInterval(interval)
              reject(error)
            }
          }, qrCheckInterval)
        })
      }

      return {
        success: true,
        qrKey,
        qrCodeData: qrCodeData.qrimg,
        checkQrStatus
      }
    } catch (error) {
      console.error('二维码登录失败:', error)
      return { success: false, message: error.message || '二维码登录失败' }
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const accountResponse = await musicApi.getUserAccount()
      if (accountResponse.code === 200 && accountResponse.profile) {
        userInfo.value = accountResponse
        
        // 获取用户详情（包含头像）
        const uid = accountResponse.profile.userId
        if (uid) {
          const detailResponse = await musicApi.getUserDetail(uid)
          if (detailResponse.code === 200) {
            userDetail.value = detailResponse
          }
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 退出登录
  const logout = async () => {
    try {
      await musicApi.logout()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      // 清除本地状态
      isLoggedIn.value = false
      userInfo.value = null
      userDetail.value = null
      token.value = null
      cookie.value = null
      localStorage.removeItem('netease-cookie')
    }
  }

  // 发送验证码
  const sendCaptcha = async (phone, ctcode = '86') => {
    try {
      const response = await musicApi.sendCaptcha(phone, ctcode)
      if (response.code === 200) {
        return { success: true, message: '验证码已发送' }
      } else if (response.code === 503) {
        return { success: false, message: '请求频率过高，请稍后再试' }
      } else {
        return { success: false, message: response.message || '发送失败' }
      }
    } catch (error) {
      console.error('发送验证码失败:', error)
      return { success: false, message: error.message || '发送验证码失败' }
    }
  }

  // 处理风控错误，尝试获取游客cookie
  const handleAnonimousLogin = async () => {
    try {
      const response = await musicApi.getAnonimousUser()
      if (response.code === 200 && response.cookie) {
        cookie.value = response.cookie
        localStorage.setItem('netease-cookie', response.cookie)
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      console.error('游客登录失败:', error)
      return { success: false }
    }
  }

  return {
    // 状态
    isLoggedIn,
    userInfo,
    userDetail,
    token,
    cookie,

    // 计算属性
    avatar,
    nickname,
    userId,

    // 方法
    initAuthState,
    loginWithCaptcha,
    loginWithQrCode,
    fetchUserInfo,
    logout,
    sendCaptcha,
    handleAnonimousLogin
  }
})