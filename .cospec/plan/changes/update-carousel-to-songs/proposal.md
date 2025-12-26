# 变更：修正轮播图显示内容为推荐新音乐

## 原因
用户需要轮播图直接展示推荐新音乐（而非歌单），移除播放按钮装饰，点击图片直接播放。

## 变更内容
- **MODIFIED**: 修改轮播图为展示推荐新音乐封面
- **REMOVED**: 移除轮播图上的播放按钮装饰元素
- **MODIFIED**: 轮播图数据源从 `/toplist/detail` 改为 `/personalized/newsong` API
- **MODIFIED**: 轮播图点击行为保持不变（点击直接播放）

## 影响
- **受影响的规范**: 首页轮播图
- **受影响的代码**:
  - `src/components/Carousel.vue`: 移除播放按钮相关的HTML和CSS样式
  - `src/api/music.js`: 修改轮播图数据获取方法 `getCarouselData()`，使用现有的 `/personalized/newsong` API
  - `src/views/home.vue`: 轮播图数据源已更新为推荐新音乐