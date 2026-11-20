import { readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'
import stylex from '@stylexjs/unplugin/rolldown'

const here = dirname(fileURLToPath(import.meta.url))

/**
 * `*.wasm?url`：rolldown 不支持 Vite 的 `?url` 后缀。这里把 wasm 当二进制资源
 * 发出去，并把 specifier 解析成一个导出运行时 URL 的虚拟模块。
 *
 * 产出的 URL 相对 `dist/` 自身（与 Vite 的 `import.meta.url` 相对资源同机制），
 * 宿主打包器会把 `new URL('./xxx.wasm', import.meta.url)` 当普通资源引用处理，
 * wasm 因此随宿主一起打包，dev 与 build 都能解析。
 */
const wasmUrlPlugin = {
  name: 'nv-wasm-url',
  resolveId: {
    order: 'pre',
    filter: { id: /\?url$/ },
    handler(source: string, importer: string | undefined) {
      if (!importer) return null
      const resolved = new URL(source.replace(/\?url$/, ''), `file://${importer}`)
      return `\0wasm-url:${fileURLToPath(resolved)}`
    },
  },
  load: {
    filter: { id: /^\0wasm-url:/ },
    handler(
      this: { emitFile: (options: { type: 'asset'; name: string; source: Buffer }) => string },
      id: string,
    ) {
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

export default defineConfig({
  entry: ['src/index.ts', 'src/agent.ts'],
  format: 'esm',
  platform: 'neutral',
  dts: {
    tsconfig: 'tsconfig.json',
    // `sidebar` 原语的实例类型包含 ui-sdk 未公开导出的辅助类型（`SlotProps`），
    // 声明发射无法为它命名。它只是内部件（对外只有组件与 controller），
    // 标 @internal 后从 d.ts 去掉，声明仍然由 `.vue` 的 props 类型对外负责。
    compilerOptions: { stripInternal: true },
  },
  plugins: [
    stylex({
      useCSSLayers: false,
      classNamePrefix: 'nx',
    }),
    Vue(),
    wasmUrlPlugin,
  ],
  external: [
    'vue',
    '@ui-sdk/vue',
    '@ui-sdk/core',
    '@stylexjs/stylex',
    '@nerv-ui/theme',
    '@embedpdf/core',
    '@embedpdf/engines',
    '@embedpdf/plugin-document-manager',
    '@embedpdf/plugin-render',
    '@embedpdf/plugin-scroll',
    '@embedpdf/plugin-viewport',
    '@embedpdf/plugin-zoom',
    '@embedpdf/models',
    '@silurus/ooxml',
  ],
})
