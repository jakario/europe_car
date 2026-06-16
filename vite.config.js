import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dev: proxy /api/chat to NVIDIA directly (API key from .env)
      '/api/chat': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: () => '/v1/chat/completions',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const apiKey = process.env.VITE_NVIDIA_API_KEY || '';
            if (apiKey) {
              proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
            }
          });
        },
      },
    },
  },
})
