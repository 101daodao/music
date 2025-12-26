## 1. 目标
在首页添加轮播图组件，展示热门歌曲封面，支持点击播放，移除所有示例数据，全面使用API数据。

## 2. 实施
- [ ] 1.1 后端API：`src/api/index.js`，添加获取轮播图数据的API接口调用（使用现有 `/toplist/detail` 接口）。
- [ ] 1.2 后端服务：`src/api/music.js`，添加轮播图数据格式化方法 `formatCarouselData` 和获取服务 `getCarouselData`。
- [ ] 1.3 前端组件：`src/components/Carousel.vue`，创建轮播图组件（新建文件），实现自动轮播、手动切换、点击播放功能。
- [ ] 1.4 前端页面：`src/views/home.vue`，集成轮播图组件到首页顶部，移除所有硬编码示例数据（`recommendMusic`、`latestMusic`、`stats`），改用API数据加载。
- [ ] 1.5 前端状态：`src/stores/player.js`，验证并扩展播放器功能，确保轮播图点击能正确播放歌曲。