## 1. 目标
修复播放器歌曲信息不显示和歌词弹窗触发不当的问题，使用Pinia统一管理歌词弹窗状态。

## 2. 实施
- [ ] 2.1 状态管理：`src/stores/player.js`，添加 `showLyricsModal` 状态和相关方法（`toggleLyricsModal`、`showLyricsModal`、`hideLyricsModal`）。
- [ ] 2.2 播放器组件：`src/components/MusicPlayer.vue`，移除本地 `showLyricsModal` 状态，改为使用Store中的状态；修改点击事件处理，按钮区域添加 `@click.stop` 阻止事件冒泡；确保歌曲信息正确显示。
- [ ] 2.3 歌词弹窗组件：`src/components/LyricsModal.vue`，修改为使用Pinia Store中的 `showLyricsModal` 状态，而非本地状态。
- [ ] 2.4 首页组件：`src/views/home.vue`，验证轮播图数据传递格式，确保 `handleCarouselItemClick` 方法正确调用播放器的 `playSong` 方法。