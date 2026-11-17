import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'
import stylex from '@stylexjs/unplugin/rolldown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'neutral',
  dts: { tsconfig: 'tsconfig.json' },
  plugins: [
    stylex({
      useCSSLayers: false,
      classNamePrefix: 'nx',
    }),
    Vue(),
  ],
  external: ['vue', '@ui-sdk/vue', '@ui-sdk/core', '@stylexjs/stylex', '@nerv-ui/theme'],
})
