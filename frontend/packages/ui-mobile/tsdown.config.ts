import Vue from 'unplugin-vue/rolldown'
import { defineConfig } from 'tsdown'

/**
 * Library build for @nerv-iip/ui-mobile (T10-1 skeleton — the template for the
 * other packages' productization).
 *
 * - Single `.` entry (index.ts barrel); `styles/mobile.css` stays a public
 *   source entry (Tailwind v4 source file — see docs/evidence/t10-packaging-survey
 *   §3 plan A), it is not bundled.
 * - SFCs compiled by unplugin-vue on rolldown; scoped `<style>` blocks are
 *   extracted into dist/index.css so hosts get component styles from the
 *   artifact instead of compiling sources.
 * - vue / @nerv-iip/ui / reka-ui / @lucide/vue / @vueuse/core stay external —
 *   they resolve through package dependencies (or the vue peer) in the host.
 * - d.ts comes from tsdown's rolldown-plugin-dts (vue-tsc under the hood); the
 *   build tsconfig below drops `vitest/globals` types so declarations never
 *   reference vitest (survey §5 R10).
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'browser',
  plugins: [Vue({ isProduction: true })],
  deps: {
    neverBundle: ['vue', '@nerv-iip/ui', 'reka-ui', '@lucide/vue', '@vueuse/core'],
  },
  dts: {
    tsconfig: 'tsconfig.build.json',
    // Vue SFCs are a Volar custom language: only the tsc generator (vue-tsc)
    // surfaces named type exports from <script setup>.
    tsc: { vue: true },
  },
  // Emit Vue SFC styles into a single extracted stylesheet.
  css: true,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
})
