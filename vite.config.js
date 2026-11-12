import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // 前端运行端口
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端地址
        changeOrigin: true, // 必须开启：模拟跨域请求的Origin
        secure: false, // 本地开发关闭https验证
        rewrite: (path) => path // 路径无需重写（后端已有/api前缀）
      }
    }
  }
});