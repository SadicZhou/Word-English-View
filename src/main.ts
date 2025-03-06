import { createApp } from 'vue'
import App from './App.vue'
import { initRouter } from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/theme.scss' // 暂时注释掉，直到创建了这个文件
import '../src/css/index.scss'
const pinia = createPinia()

const app = createApp(App)
initRouter(app)
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')
