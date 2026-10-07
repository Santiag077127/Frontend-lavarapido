import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

export default defineConfig(({ mode }) => {
  if (mode === 'production') {
    const apiUrl = loadEnv(mode, process.cwd(), 'VITE_').VITE_API_URL
    if (!apiUrl) throw new Error('VITE_API_URL is required for the production build')
    const parsed = new URL(apiUrl)
    if (parsed.protocol !== 'https:' || parsed.pathname !== '/api' || parsed.username || parsed.password || parsed.search || parsed.hash) {
      throw new Error('VITE_API_URL must be a public HTTPS URL ending in /api')
    }
  }
  return {
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,  
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
      },
    },
  },
  }
})
