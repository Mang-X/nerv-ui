import { defineConfig } from 'vitest/config'
import Vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
export default defineConfig({
  plugins: [Vue(), tailwindcss(), wasm()],
  resolve: { dedupe: ['vue'] },
  test: { environment: 'node', include: ['docs.contract.test.ts'] },
})
