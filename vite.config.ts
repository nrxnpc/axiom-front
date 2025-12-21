import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name].js',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Разделяем на более мелкие чанки
            if (id.includes('react-admin')) {
              return 'react-admin';
            }
            if (id.includes('@mui/material') || id.includes('@mui/icons-material')) {
              return 'mui';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@emotion')) {
              return 'emotion';
            }
            // Остальные vendor библиотеки
            return 'vendor';
          }
        },
      }
    }
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
})

