import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // If 5173 is busy, Vite will try the next available port.
    // strictPort: true would throw an error instead — keep false for convenience.
    strictPort: false,
    // Proxy: all /api and /cashfree requests → Spring Boot on 8080.
    // This works regardless of which port Vite ends up on, because the
    // proxy runs server-side (no CORS involved for proxied requests).
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Log proxy activity in dev
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[proxy] error:', err.message)
          })
          proxy.on('proxyReq', (_, req) => {
            console.debug('[proxy] →', req.method, req.url)
          })
        },
      },
      '/cashfree': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
