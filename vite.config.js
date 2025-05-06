import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createRequire } from 'module'
// https://vite.dev/config/
const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      os: 'os-browserify/browser',
    },
  },
  define: {
    'process.env': {},
  },
})
