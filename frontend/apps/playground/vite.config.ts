import { nativeFixture } from './nativeFixture'
import wasm from 'vite-plugin-wasm'
import Vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tailwindcss(), Vue(), wasm(), nativeFixture()],
  resolve: { dedupe: ['vue'] },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] },
})
