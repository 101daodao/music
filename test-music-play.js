// 音乐播放测试脚本
// 运行方式：在浏览器控制台中执行

async function testMusicPlayer() {
  console.log('🎵 开始测试音乐播放功能...')
  
  // 等待页面和组件加载完成
  await new Promise(resolve => {
    if (document.querySelector('.music-player')) {
      resolve()
    } else {
      setTimeout(resolve, 2000)
    }
  })
  
  const musicPlayer = document.querySelector('audio')
  if (!musicPlayer) {
    console.error('❌ 未找到音频播放器元素')
    return
  }
  
  console.log('✅ 找到音频播放器元素')
  
  // 获取Vue组件实例（如果可能）
  const playerComponent = document.querySelector('.music-player').__vueParentComponent?.ctx
  if (!playerComponent) {
    console.warn('⚠️ 无法获取播放器组件实例，将直接测试音频元素')
  }
  
  // 测试1：检查播放列表
  if (playerComponent && playerComponent.playlist?.length > 0) {
    console.log(`✅ 播放列表包含 ${playerComponent.playlist.length} 首歌曲`)
    console.log('第一首歌曲:', playerComponent.playlist[0])
  } else {
    console.warn('⚠️ 播放列表为空或无法访问')
  }
  
  // 测试2：模拟播放第一首歌曲
  if (playerComponent && playerComponent.playlist?.length > 0) {
    try {
      console.log('🎯 开始测试播放第一首歌曲...')
      
      // 设置当前歌曲索引为0并加载
      await playerComponent.loadSong(0)
      
      // 等待音频加载
      setTimeout(() => {
        if (musicPlayer.src) {
          console.log('✅ 音频URL已设置:', musicPlayer.src)
          
          // 检查音频是否可以播放
          if (musicPlayer.readyState >= 2) {
            console.log('✅ 音频已准备就绪，可以播放')
            
            // 测试播放
            musicPlayer.play().then(() => {
              console.log('✅ 音频播放成功！')
              console.log(`🎼 当前播放: ${playerComponent.currentSong?.title || '未知'} - ${playerComponent.currentSong?.artist || '未知'}`)
              
              // 5秒后自动停止测试
              setTimeout(() => {
                musicPlayer.pause()
                console.log('⏹️ 测试结束，音频已暂停')
              }, 5000)
              
            }).catch(error => {
              console.error('❌ 音频播放失败:', error)
            })
          } else {
            console.warn('⚠️ 音频尚未准备就绪')
          }
        } else {
          console.error('❌ 音频URL未设置')
        }
      }, 2000)
      
    } catch (error) {
      console.error('❌ 加载歌曲时发生错误:', error)
    }
  }
  
  // 测试3：测试切换歌曲
  setTimeout(() => {
    if (playerComponent && playerComponent.playlist?.length > 1) {
      console.log('🎯 测试切换到下一首歌曲...')
      playerComponent.nextSong()
      
      setTimeout(() => {
        console.log(`🎼 切换后播放: ${playerComponent.currentSong?.title || '未知'} - ${playerComponent.currentSong?.artist || '未知'}`)
      }, 1000)
    }
  }, 8000)
}

// 导出测试函数
window.testMusicPlayer = testMusicPlayer

console.log('🔧 音乐播放测试脚本已加载')
console.log('💡 在控制台中运行 testMusicPlayer() 开始测试')