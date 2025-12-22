import { createApp } from 'vue'
import App from './App.vue'

// 引入路由配置
import router from './router'

// 1. 引入 Element Plus 和它的样式文件
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 1. 导入createPinia
import { createPinia } from 'pinia'

const pinia = createPinia()

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(pinia)
app.mount('#app')