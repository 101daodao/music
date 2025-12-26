<template>
  <Teleport to="body">
    <div v-if="show" class="login-modal-overlay" @click="handleClose">
      <div class="login-modal-content" @click.stop>
        <!-- 关闭按钮 -->
        <button class="login-modal__close" @click="handleClose">×</button>
        
        <!-- 标题 -->
        <h2 class="login-modal__title">登录</h2>
        
        <!-- 切换标签 -->
        <div class="login-modal__tabs">
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'phone' }"
            @click="activeTab = 'phone'"
          >
            手机号登录
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'qrcode' }"
            @click="handleTabChange('qrcode')"
          >
            扫码登录
          </button>
        </div>
        
        <!-- 手机号登录表单 -->
        <div v-show="activeTab === 'phone'" class="login-modal__form">
          <!-- 手机号输入 -->
          <div class="form-group">
            <input
              v-model="phoneForm.phone"
              type="tel"
              placeholder="请输入手机号"
              class="form-input"
              maxlength="11"
            >
          </div>
          
          <!-- 验证码输入 -->
          <div class="form-group form-group--captcha">
            <input
              v-model="phoneForm.captcha"
              type="text"
              placeholder="请输入验证码"
              class="form-input form-input--captcha"
              maxlength="6"
            >
            <button 
              class="captcha-button" 
              :disabled="isSending || countdown > 0"
              @click="handleSendCaptcha"
            >
              {{ countdown > 0 ? `${countdown}s后重试` : '发送验证码' }}
            </button>
          </div>
          
          <!-- 错误提示 -->
          <div v-if="phoneForm.error" class="form-error">
            {{ phoneForm.error }}
          </div>
          
          <!-- 登录按钮 -->
          <button 
            class="login-button" 
            :disabled="!isPhoneFormValid || phoneForm.loading"
            @click="handlePhoneLogin"
          >
            {{ phoneForm.loading ? '登录中...' : '登录' }}
          </button>
        </div>
        
        <!-- 扫码登录 -->
        <div v-show="activeTab === 'qrcode'" class="login-modal__qrcode">
          <div class="qrcode-container">
            <div v-if="qrcodeState.loading" class="qrcode-loading">
              <div class="loading-spinner"></div>
              <p>二维码生成中...</p>
            </div>
            
            <div v-else-if="qrcodeState.expired" class="qrcode-expired">
              <p>二维码已过期</p>
              <button class="refresh-button" @click="generateQrCode">刷新二维码</button>
            </div>
            
            <div v-else-if="qrcodeState.scanning" class="qrcode-scanning">
              <p>请使用网易云音乐App扫码登录</p>
            </div>
            
            <div v-else class="qrcode-wrapper">
              <img :src="qrcodeState.qrData" alt="扫码登录" class="qrcode-image">
              <p class="qrcode-tip">请使用网易云音乐App扫码登录</p>
            </div>
          </div>
        </div>
        
        <!-- 提示信息 -->
        <div class="login-modal__footer">
          <p class="login-tip">登录即表示同意《网易云音乐服务协议》</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'login-success'])

// Store
const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('phone')
const qrCheckTimer = ref(null)

// 手机号表单状态
const phoneForm = ref({
  phone: '',
  captcha: '',
  error: '',
  loading: false
})

// 发送验证码状态
const isSending = ref(false)
const countdown = ref(0)
const countdownTimer = ref(null)

// 二维码状态
const qrcodeState = ref({
  qrKey: '',
  qrData: '',
  loading: false,
  expired: false,
  scanning: false
})

// 计算属性
const isPhoneFormValid = computed(() => {
  return phoneForm.value.phone.length === 11 && phoneForm.value.captcha.length > 0
})

// 方法
const handleClose = () => {
  emit('close')
}

const handleTabChange = (tab) => {
  activeTab.value = tab
  if (tab === 'qrcode' && !qrcodeState.value.qrData) {
    generateQrCode()
  }
}

// 发送验证码
const handleSendCaptcha = async () => {
  if (phoneForm.value.phone.length !== 11) {
    phoneForm.value.error = '请输入正确的手机号'
    return
  }
  
  isSending.value = true
  phoneForm.value.error = ''
  
  const result = await authStore.sendCaptcha(phoneForm.value.phone)
  
  isSending.value = false
  
  if (result.success) {
    // 开始倒计时
    countdown.value = 60
    countdownTimer.value = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer.value)
      }
    }, 1000)
  } else {
    phoneForm.value.error = result.message
  }
}

// 手机号登录
const handlePhoneLogin = async () => {
  if (!isPhoneFormValid.value) return
  
  phoneForm.value.loading = true
  phoneForm.value.error = ''
  
  const result = await authStore.loginWithCaptcha(phoneForm.value.phone, phoneForm.value.captcha)
  
  phoneForm.value.loading = false
  
  if (result.success) {
    emit('login-success')
    handleClose()
  } else {
    phoneForm.value.error = result.message
  }
}

// 生成二维码
const generateQrCode = async () => {
  qrcodeState.value.loading = true
  qrcodeState.value.expired = false
  
  try {
    const result = await authStore.loginWithQrCode()
    
    if (result.success) {
      qrcodeState.value.qrKey = result.qrKey
      qrcodeState.value.qrData = result.qrCodeData
      qrcodeState.value.loading = false
      
      // 开始轮询检查扫码状态，间隔5秒避免触发风控
      startQrCheck(result.checkQrStatus)
    } else {
      qrcodeState.value.loading = false
      alert(result.message)
    }
  } catch (error) {
    qrcodeState.value.loading = false
    console.error('生成二维码失败:', error)
    alert('生成二维码失败，请稍后重试')
  }
}

// 开始二维码检查
const startQrCheck = (checkQrStatus) => {
  // 使用5秒间隔轮询，避免触发风控检测
  qrCheckTimer.value = setInterval(async () => {
    try {
      const result = await checkQrStatus()
      
      if (result.success) {
        emit('login-success')
        handleClose()
        stopQrCheck()
      } else {
        qrcodeState.value.expired = true
        stopQrCheck()
        alert(result.message || '二维码已过期')
      }
    } catch (error) {
      qrcodeState.value.expired = true
      stopQrCheck()
      console.error('二维码检查失败:', error)
      alert('二维码检查失败，请重新生成')
    }
  }, 5000) // 5秒间隔
}

// 停止二维码检查
const stopQrCheck = () => {
  if (qrCheckTimer.value) {
    clearInterval(qrCheckTimer.value)
    qrCheckTimer.value = null
  }
}

// 监听弹窗显示状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 重置表单
    phoneForm.value = {
      phone: '',
      captcha: '',
      error: '',
      loading: false
    }
    
    // 如果切换到二维码标签且没有二维码数据，生成二维码
    if (activeTab.value === 'qrcode' && !qrcodeState.value.qrData) {
      generateQrCode()
    }
  } else {
    // 关闭弹窗时清理轮询
    stopQrCheck()
  }
})

// 生命周期
onMounted(() => {
  // 初始化认证状态
  authStore.initAuthState()
})

onBeforeUnmount(() => {
  // 清理定时器
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
  stopQrCheck()
})
</script>

<style scoped>
/* 遮罩层 */
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 弹窗内容 */
.login-modal-content {
  position: relative;
  background: var(--color-bg-primary, #ffffff);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 关闭按钮 */
.login-modal__close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 32px;
  color: var(--color-text-secondary, #666);
  cursor: pointer;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.login-modal__close:hover {
  background-color: var(--color-bg-tertiary, #f5f5f5);
  color: var(--color-text-primary, #333);
}

/* 标题 */
.login-modal__title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary, #333);
  text-align: center;
}

/* 标签页 */
.login-modal__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
}

.tab-button {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 16px;
  color: var(--color-text-secondary, #666);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button.active {
  color: var(--color-primary, #c20c0c);
  border-bottom-color: var(--color-primary, #c20c0c);
  font-weight: 600;
}

.tab-button:hover:not(.active) {
  color: var(--color-text-primary, #333);
}

/* 表单 */
.login-modal__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px;
  font-size: 14px;
  color: var(--color-text-primary, #333);
  background-color: var(--color-bg-primary, #ffffff);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary, #c20c0c);
  box-shadow: 0 0 0 2px rgba(194, 12, 12, 0.1);
}

.form-input::placeholder {
  color: var(--color-text-placeholder, #999);
}

.form-group--captcha {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.form-input--captcha {
  flex: 1;
}

.captcha-button {
  padding: 12px 16px;
  background-color: var(--color-primary, #c20c0c);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.captcha-button:hover:not(:disabled) {
  background-color: #a80a0a;
}

.captcha-button:disabled {
  background-color: var(--color-text-placeholder, #999);
  cursor: not-allowed;
}

.form-error {
  color: #f44336;
  font-size: 14px;
  padding: 4px 0;
}

.login-button {
  padding: 14px;
  background-color: var(--color-primary, #c20c0c);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.login-button:hover:not(:disabled) {
  background-color: #a80a0a;
  transform: translateY(-1px);
}

.login-button:disabled {
  background-color: var(--color-text-placeholder, #999);
  cursor: not-allowed;
  transform: none;
}

/* 二维码 */
.login-modal__qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.qrcode-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 240px;
}

.qrcode-wrapper {
  text-align: center;
}

.qrcode-image {
  width: 200px;
  height: 200px;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px;
  padding: 8px;
  background-color: white;
}

.qrcode-tip {
  margin-top: 16px;
  font-size: 14px;
  color: var(--color-text-secondary, #666);
}

.qrcode-loading,
.qrcode-expired,
.qrcode-scanning {
  text-align: center;
  color: var(--color-text-secondary, #666);
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid var(--color-border, #e0e0e0);
  border-top-color: var(--color-primary, #c20c0c);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.refresh-button {
  margin-top: 16px;
  padding: 12px 24px;
  background-color: var(--color-primary, #c20c0c);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-button:hover {
  background-color: #a80a0a;
}

/* 底部提示 */
.login-modal__footer {
  margin-top: 24px;
  text-align: center;
}

.login-tip {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-placeholder, #999);
}

/* 暗黑主题适配 */
.theme-dark .login-modal-content {
  background-color: #2a2a2a;
}

.theme-dark .form-input {
  background-color: #333;
  border-color: #444;
  color: #fff;
}

.theme-dark .form-input:focus {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
}

.theme-dark .form-input::placeholder {
  color: #888;
}

.theme-dark .qrcode-image {
  border-color: #444;
}
</style>