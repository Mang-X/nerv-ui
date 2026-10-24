import Vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tailwindcss(), Vue()],
  resolve: { dedupe: ['vue'] },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] },
})
