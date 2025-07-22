import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  root: './',
  plugins: [react()],
  server: {
    fs: {
      strict: false,
    },
  },
  assetsInclude: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
})
