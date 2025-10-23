import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production configuration for putada.date deployment
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'putada.date',
      'putana.date',
      '.putada.date',
      '.putana.date',
      '10.1.1.143' // Your local network IP
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          game: ['./src/context/GameContext.jsx', './src/hooks/useGameLoop.js']
        }
      }
    }
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'putada.date',
      'putana.date',
      '.putada.date',
      '.putana.date',
      '10.1.1.143'
    ]
  }
})
