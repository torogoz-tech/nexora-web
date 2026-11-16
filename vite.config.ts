import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/mcp': {
        target: 'https://api.nexora.infinitechsv.org',
        changeOrigin: true,
      },
      '/api': {
        target: 'https://api.nexora.infinitechsv.org',
        changeOrigin: true,
      },
    },
  },
})
