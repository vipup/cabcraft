import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'putada.date',
      'putana.date', // In case of typo
      '.putada.date', // Allow subdomains
      '.putana.date'  // Allow subdomains
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})

