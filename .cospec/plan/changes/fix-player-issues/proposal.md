# 变更：修复播放器歌曲信息同步和歌词弹窗触发问题

## 原因
播放器存在两个问题：1) 歌曲信息没有正确同步显示，显示"暂无播放"；2) 歌词弹窗触发时机不当，点击按钮时不应该触发展开。

## 变更内容
- **MODIFIED**: 在播放器状态管理中添加歌词弹窗可见状态，使用Pinia统一管理
- **MODIFIED**: 修改播放器组件，点击按钮区域不触发展开歌词弹窗
- **MODIFIED**: 修正歌曲数据传递格式，确保歌曲信息正确同步到播放器
- **MODIFIED**: 优化轮播图点击播放的数据传递逻辑

## 影响
- **受影响的规范**: 播放器交互、状态管理
- **受影响的代码**:
  - `src/stores/player.js`: 添加 `showLyricsModal` 状态和相关方法
  - `src/components/MusicPlayer.vue`: 修改点击事件处理，按钮区域不触发展开
  - `src/components/LyricsModal.vue`: 使用Pinia状态控制弹窗显示
  - `src/views/home.vue`: 确保轮播图数据格式正确传递