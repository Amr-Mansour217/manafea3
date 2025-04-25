import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/feedback': {
        target: 'http://srv759235.hstgr.cloud',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})