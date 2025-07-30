import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // 💡 '/api'로 시작하는 모든 요청을 대상으로 프록시 설정
      '/api': {
        target: 'http://localhost:8080', // Spring 백엔드 서버 주소
        changeOrigin: true,              // CORS 오류 방지를 위해 출처를 변경
      }
    }
  },
  
});
