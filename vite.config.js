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
  }
})
