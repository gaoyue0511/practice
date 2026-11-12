// 示例：main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 导入路由配置文件（需确保路径正确）

const app = createApp(App)
app.use(router) // 必须执行这一步，注册vue-router的组件
app.mount('#app')