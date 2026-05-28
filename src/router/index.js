import { createRouter, createWebHistory } from 'vue-router'

// 路由组件懒加载
const Home = () => import('../views/home.vue')
const Rank = () => import('../views/rank.vue')
const Playlist = () => import('../views/playlist.vue')
const MyPlaylists = () => import('../views/my-playlists.vue')
const Mine = () => import('../views/mine.vue')
const MV = () => import('../views/mv.vue')

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      keepAlive: true,
      requiresAuth: false
    }
  },
  {
    path: '/rank',
    name: 'Rank',
    component: Rank,
    meta: {
      title: '排行榜',
      keepAlive: true,
      requiresAuth: false
    }
  },
  {
    path: '/playlist/:id',
    name: 'Playlist',
    component: Playlist,
    meta: {
      title: '歌单详情',
      keepAlive: false,
      requiresAuth: false
    }
  },
  {
    path: '/my-playlists',
    name: 'MyPlaylists',
    component: MyPlaylists,
    meta: {
      title: '我的歌单',
      keepAlive: true,
      requiresAuth: false
    }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: Mine,
    meta: {
      title: '个人中心',
      keepAlive: true,
      requiresAuth: false
    }
  },
  {
    path: '/mv',
    name: 'MV',
    component: MV,
    meta: {
      title: 'MV播放',
      keepAlive: true,
      requiresAuth: false
    }
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/404.vue'),
    meta: {
      title: '页面不存在',
      keepAlive: false,
      requiresAuth: false
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 路由切换时的滚动行为
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 网易云音乐`
  } else {
    document.title = '网易云音乐'
  }

  // 权限检查
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('netease-token')
    if (!token) {
      // 未登录，重定向到首页
      next({
        path: '/',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // 页面加载开始事件
  window.dispatchEvent(new CustomEvent('page-loading'))

  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 页面加载完成事件
  window.dispatchEvent(new CustomEvent('page-loaded'))
  
  // 百度统计或其他页面统计（可选）
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.path
    })
  }
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 可以在这里添加错误上报逻辑
})

export default router

// 导出路由配置，供其他地方使用
export { routes }