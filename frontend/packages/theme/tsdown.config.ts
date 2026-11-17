import { defineConfig } from 'tsdown'
import stylex from '@stylexjs/unplugin/rolldown'

export default defineConfig({
  entry: ['src/index.ts', 'src/tokens.stylex.ts', 'src/shared.stylex.ts'],
  format: 'esm',
  platform: 'neutral',
  dts: true,
  plugins: [stylex({ classNamePrefix: 'nx' })],
  external: ['@stylexjs/stylex'],
})
