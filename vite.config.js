import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
import { fileURLToPath, URL } from 'url';
const proxyTarget = process.env.VITE_API_BASE_URL || 'https://necta-backend.vercel.app'

export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
}))
