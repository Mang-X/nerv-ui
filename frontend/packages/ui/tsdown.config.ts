import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import Vue from 'unplugin-vue/rolldown'
import { defineConfig } from 'tsdown'

/**
 * `*.wasm?url` support: Rolldown doesn't implement Vite's `?url` suffix, so a
 * plain resolve/load plugin emits the binary as an asset and resolves the
 * specifier to a virtual module exporting its runtime URL.
 *
 * The generated URL is relative to `dist/` itself (same mechanism as Vite's
 * `import.meta.url`-relative assets) — the host bundler treats the emitted
 * `new URL('./xxx.wasm', import.meta.url)` as a normal asset reference, so the
 * wasm lands in the host bundle and resolves in dev and build alike.
 */
const wasmUrlPlugin = {
  name: 'nv-wasm-url',
  resolveId: {
    order: 'pre',
    filter: { id: /\?url$/ },
    handler(source, importer) {
      if (!importer) return null
      const resolved = new URL(source.replace(/\?url$/, ''), `file://${importer}`)
      return `\0wasm-url:${fileURLToPath(resolved)}`
    },
  },
  load: {
    filter: { id: /^\0wasm-url:/ },
    handler(id) {
      const file = id.slice('\0wasm-url:'.length)
      const ref = this.emitFile({
        type: 'asset',
        name: file.split('/').pop() ?? 'asset.wasm',
        source: readFileSync(file),
      })
      return `export default new URL(import.meta.ROLLDOWN_FILE_URL_${ref}, import.meta.url).href`
    },
  },
}

/**
 * Library build for @nerv-ui/ui (T10-3 — follows the T10-1 ui-mobile skeleton;
 * see docs/evidence/t10-1-host-check.md for the template rationale).
 *
 * - `.` is the full-form barrel; `./desktop`, `./screen`, `./pad` are optional
 *   per-form subpaths pointing at the pc / screen / touch barrels so hosts can
 *   import only the form they need. `./file-preview` and `./test-support`
 *   stay separate subpath entries.
 * - The three css entries (`./styles.css`, `./theme.css`, `./overrides.css`)
 *   keep pointing at Tailwind v4 source files in src/styles/ — they are the
 *   final form (survey §3 plan A); `files` ships src as the @source scan
 *   surface + css carrier.
 * - vue / reka-ui / @lucide/vue / @vueuse/core and every runtime dependency
 *   stay external — they resolve through package dependencies (or the vue /
 *   reka-ui peers) in the host. `?url` wasm imports in file-preview are
 *   emitted as assets with runtime-resolvable URLs.
 * - d.ts comes from tsdown's rolldown-plugin-dts (vue-tsc under the hood):
 *   `<script setup>` `export interface` only surfaces as named exports via
 *   the tsc generator (T10-1 pitfall). The build tsconfig drops vitest types
 *   so declarations never reference vitest (survey §5 R10).
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    desktop: 'src/components/pc/index.ts',
    screen: 'src/components/screen/index.ts',
    pad: 'src/components/touch/index.ts',
    'file-preview': 'src/components/ui/file-preview/index.ts',
    'test-support': 'src/test-support/index.ts',
  },
  format: 'esm',
  platform: 'browser',
  plugins: [Vue({ isProduction: true }), wasmUrlPlugin],
  deps: {
    neverBundle: [
      'vue',
      'reka-ui',
      '@lucide/vue',
      '@vueuse/core',
      'vue-sonner',
      '@unovis/ts',
      '@unovis/vue',
      '@tanstack/vue-table',
      'motion-v',
      '@internationalized/date',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      '@embedpdf/core',
      '@embedpdf/engines',
      '@embedpdf/plugin-document-manager',
      '@embedpdf/plugin-render',
      '@embedpdf/plugin-scroll',
      '@embedpdf/plugin-viewport',
      '@embedpdf/plugin-zoom',
      '@silurus/ooxml',
    ],
  },
  dts: {
    tsconfig: 'tsconfig.build.json',
    tsc: { vue: true },
  },
  css: true,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
})
