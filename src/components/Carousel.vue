<template>
  <div class="carousel-container" @mouseenter="pauseAutoPlay" @mouseleave="resumeAutoPlay">
    <!-- 轮播图主体 -->
    <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <div 
        v-for="(item, index) in items" 
        :key="index"
        class="carousel-slide"
        @click="handleItemClick(item)"
      >
        <img :src="item.cover" :alt="item.title" class="carousel-image" />
        <div class="carousel-overlay">
          <h3 class="carousel-title">{{ item.title }}</h3>
          <p class="carousel-artist">{{ item.artist }}</p>
        </div>
      </div>
    </div>

    <!-- 左右切换按钮 -->
    <div class="carousel-nav prev" @click.stop="prevSlide">
      <span>‹</span>
    </div>
    <div class="carousel-nav next" @click.stop="nextSlide">
      <span>›</span>
    </div>

    <!-- 指示器 -->
    <div class="carousel-indicators">
      <div 
        v-for="(item, index) in items" 
        :key="index"
        class="indicator"
        :class="{ active: index === currentIndex }"
        @click.stop="goToSlide(index)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['item-click'])

const currentIndex = ref(0)
let autoPlayTimer = null

// 切换到下一张
const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % props.items.length
}

// 切换到上一张
const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length
}

// 跳转到指定索引
const goToSlide = (index) => {
  currentIndex.value = index
}

// 处理项目点击
const handleItemClick = (item) => {
  emit('item-click', item)
}

// 自动播放
const startAutoPlay = () => {
  if (props.autoplay) {
    autoPlayTimer = setInterval(nextSlide, props.interval)
  }
}

// 暂停自动播放
const pauseAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

// 恢复自动播放
const resumeAutoPlay = () => {
  startAutoPlay()
}

onMounted(() => {
  startAutoPlay()
})

onBeforeUnmount(() => {
  pauseAutoPlay()
})
</script>

<style scoped>
.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.carousel-slide {
  min-width: 100%;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 16/6;
  display: block;
  transition: transform 0.3s ease;
}

.carousel-slide:hover .carousel-image {
  transform: scale(1.05);
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-lg);
  color: white;
}

.carousel-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.carousel-artist {
  font-size: var(--font-size-base);
  opacity: 0.9;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  z-index: 10;
}

.carousel-container:hover .carousel-nav {
  opacity: 1;
}

.carousel-nav:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translateY(-50%) scale(1.1);
}

.carousel-nav.prev {
  left: var(--spacing-md);
}

.carousel-nav.next {
  right: var(--spacing-md);
}

.carousel-nav span {
  font-size: 32px;
  line-height: 1;
}

.carousel-indicators {
  position: absolute;
  bottom: var(--spacing-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-sm);
  z-index: 10;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.7);
}

.indicator.active {
  background: white;
  width: 32px;
}
</style>