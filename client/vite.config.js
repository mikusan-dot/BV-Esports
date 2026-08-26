import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  console.log('=== VITE ENV DEBUG ===')
  console.log('cwd:', process.cwd())
  console.log('mode:', mode)
  console.log('ALL ENV KEYS:', Object.keys(env))
console.log('VITE_API_URL:', JSON.stringify(env.VITE_API_URL))
  console.log('======================')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
        },
      },
    },
  }
})