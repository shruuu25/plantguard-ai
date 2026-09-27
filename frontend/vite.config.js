import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/health': 'http://127.0.0.1:8000',
      '/predict': 'http://127.0.0.1:8000',
      '/diseases': 'http://127.0.0.1:8000',
      '/stats': 'http://127.0.0.1:8000',
      '/results': 'http://127.0.0.1:8000'
    }
  }
})
