import { createApp } from 'vue'
import App from './App.vue'
import { initRouter } from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import SzTable from './components/SzTable'
// import './styles/theme.scss' // 暂时注释掉，直到创建了这个文件
// import '../src/css/index.scss' // 确认路径和文件是否存在

const pinia = createPinia()

const app = createApp(App)
initRouter(app)
app.use(pinia)
app.use(ElementPlus, {
    locale: zhCn
})

// 注册 SzTable 组件
app.use(SzTable)
app.mount('#app')