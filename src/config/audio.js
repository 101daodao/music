// 音频配置文件
export const audioConfig = {
  // 备用音频配置
  fallbackAudios: [
    {
      id: 'demo-1',
      title: '示例音频',
      artist: '网易云音乐',
      album: '测试专辑',
      cover: 'https://picsum.photos/200/200?demo1',
      url: '/audio/demo.mp3',
      duration: 180 // 3分钟示例
    }
  ],
  
  // 在线音频源（使用免费可用的示例音频）
  onlineAudios: [
    {
      id: 'online-1',
      title: 'Peace of Mind',
      artist: 'Sample Artist',
      album: 'Relaxation Collection',
      cover: 'https://picsum.photos/200/200?online1',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // 示例音频URL
      duration: 120
    }
  ],
  
  // 默认音频配置
  defaultAudio: {
    id: 'default',
    title: '默认音频',
    artist: '网易云音乐',
    album: '默认专辑',
    cover: 'https://picsum.photos/200/200?default',
    url: '/audio/demo.mp3',
    duration: 180
  }
}

// 音频验证工具
export const audioUtils = {
  // 检查音频URL是否有效
  isValidAudioUrl(url) {
    if (!url || typeof url !== 'string') {
      return false
    }
    
    // 检查是否是支持的音频格式
    const supportedFormats = ['.mp3', '.wav', '.ogg', '.m4a', '.aac']
    const hasValidExtension = supportedFormats.some(format =>
      url.toLowerCase().includes(format)
    )
    
    // 检查是否是有效的URL或相对路径
    const isValidUrl = url.startsWith('http') || url.startsWith('/')
    
    return hasValidExtension && isValidUrl
  },
  
  // 获取备用音频
  getFallbackAudio(index = 0) {
    return audioConfig.fallbackAudios[index] || audioConfig.fallbackAudios[0]
  },
  
  // 获取默认音频
  getDefaultAudio() {
    return audioConfig.defaultAudio
  },
  
  // 修复音频URL
  fixAudioUrl(url) {
    if (!url) {
      return this.getFallbackAudio().url
    }
    
    // 如果URL无效，返回备用音频URL
    if (!this.isValidAudioUrl(url)) {
      console.warn('音频URL无效，使用备用音频:', url)
      return this.getFallbackAudio().url
    }
    
    return url
  },
  
  // 获取下一个备用音频
  getNextFallbackAudio(currentUrl) {
    const currentIndex = audioConfig.fallbackAudios.findIndex(audio => audio.url === currentUrl)
    const nextIndex = (currentIndex + 1) % audioConfig.fallbackAudios.length
    return this.getFallbackAudio(nextIndex)
  }
}