import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/css/index.scss'
import pinia from './store/store'
const app = createApp(App)
app.use(pinia)
import { initRouter } from './router'
initRouter(app)
app.use(ElementPlus)
app.mount('#app')
