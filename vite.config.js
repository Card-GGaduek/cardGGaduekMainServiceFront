import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // '/api'로 시작하는 요청을 대상 서버로 전달
      // '/api'로 시작하는 요청을 대상 서버로 전달
      '/api': {

        target: 'http://localhost:8080', // 백엔드 주소
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'), // /api 유지
      },
    },
  },
});