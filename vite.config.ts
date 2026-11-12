import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 新增：跨域代理配置（对接后端服务）
  server: {
    port: 5173, // 前端运行端口（默认是5173，可根据实际调整）
    proxy: {
      // 匹配所有以 /api 开头的请求，转发到后端地址
      '/api': {
        target: 'http://localhost:3000', // 后端服务地址（和你启动的后端端口一致）
        changeOrigin: true, // 开启跨域（模拟后端的请求源）
        secure: false, // 本地开发关闭 HTTPS 验证（避免本地证书问题）
        rewrite: (path) => path // 路径不重写（后端接口本身带 /api 前缀）
      }
    }
  }
})