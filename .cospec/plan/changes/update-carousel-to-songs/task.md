## 1. 目标
修正轮播图为展示推荐新音乐，移除播放按钮装饰，使用 /personalized/newsong API 数据源。

## 2. 实施
- [ ] 2.1 前端组件：`src/components/Carousel.vue`，移除轮播图模板中的播放按钮元素（移除 `<div class="play-button">` 相关代码）。
- [ ] 2.2 前端组件：`src/components/Carousel.vue`，移除播放按钮相关CSS样式（删除 `.play-button` 样式及相关动画）。
- [ ] 2.3 后端服务：`src/api/music.js`，修改 `getCarouselData()` 方法，改用 `/personalized/newsong` API获取推荐新音乐数据。
- [ ] 2.4 后端服务：`src/api/music.js`，确认数据格式化方法能正确处理推荐新音乐的响应格式。
- [ ] 2.5 前端页面：`src/views/home.vue`，验证轮播图组件数据传递正确。