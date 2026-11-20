import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'
import stylex from '@stylexjs/unplugin/rolldown'

export default defineConfig({
  entry: ['src/index.ts', 'src/agent.ts'],
  format: 'esm',
  platform: 'neutral',
  dts: { tsconfig: 'tsconfig.json' },
  plugins: [
    stylex({
      useCSSLayers: false,
      // Screen owns its own palette: prefixing the compiler output keeps every
      // generated screen variable/class in the `scr*` namespace (`--scr…`).
      classNamePrefix: 'scr',
    }),
    Vue(),
  ],
  external: ['vue', '@ui-sdk/vue', '@ui-sdk/core', '@stylexjs/stylex', '@nerv-ui-next/theme'],
})
