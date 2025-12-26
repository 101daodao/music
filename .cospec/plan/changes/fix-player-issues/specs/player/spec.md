## ADDED Requirements

### Requirement: 歌词弹窗状态管理
系统应使用Pinia统一管理歌词弹窗的显示状态。

#### Scenario: 在播放器Store中管理弹窗状态
- **WHEN** 首页加载或用户交互
- **THEN** 播放器Store应包含 `showLyricsModal` 状态
- **AND** 提供显示/隐藏弹窗的方法 `toggleLyricsModal()`、`showLyricsModal()`、`hideLyricsModal()`

## MODIFIED Requirements

### Requirement: 播放器弹窗触发
歌词弹窗应只在点击播放器空白区域时触发，点击控制按钮时不触发。

**修改内容**:
- **WHEN** 用户点击播放器的主体空白区域（非按钮区域）
- **THEN** 应切换歌词弹窗的显示状态
- **AND** 点击播放控制按钮（播放/暂停、上一首、下一首、播放模式、音量控制）时不应触发育词弹窗
- **AND** 点击歌曲封面区域时不应触发育词弹窗

#### Scenario: 点击控制按钮播放音乐
- **WHEN** 用户点击播放控制按钮
- **THEN** 应执行对应的播放控制操作
- **AND** 不触发育词弹窗的显示/隐藏
- **AND** 歌曲信息应正确同步显示（标题、歌手、封面）

### Requirement: 歌曲信息同步
播放器应正确显示当前播放歌曲的信息。

**修改内容**:
- **WHEN** 从轮播图或其他地方点击播放歌曲
- **THEN** 歌曲数据应正确传递到播放器Store
- **AND** 播放器界面的 `currentSong` 应立即更新显示歌曲标题和歌手
- **AND** 不应显示"暂无播放"或其他错误信息
- **AND** 歌曲封面图片应正确加载显示