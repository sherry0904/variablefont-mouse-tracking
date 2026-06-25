import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 載入所有環境變數，包含 process.env
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // 優先使用 VITE_BASE_PATH，若無則預設為 '/'
    base: env.VITE_BASE_PATH || '/',
    plugins: [vue()],
    // 多頁入口：舊頁面 index.html 不動，新功能獨立在 animate.html
    build: {
      rollupOptions: {
        input: {
          main: resolve(process.cwd(), 'index.html'),
          animate: resolve(process.cwd(), 'animate.html'),
        },
      },
    },
    // 綁定所有網卡，讓同一個 Wi-Fi 的手機可透過區網 IP 存取
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
    },
  }
})
