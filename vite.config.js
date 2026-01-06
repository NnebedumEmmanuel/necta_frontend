import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
import { fileURLToPath, URL } from 'url';
// Read backend target from env during dev. If VITE_API_BASE_URL is set, use it
// as the proxy target; otherwise default to the deployed backend host.
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
      // Proxy /api requests in dev to the backend. No rewrite - preserve /api prefix.
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
}))
