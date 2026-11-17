import { createRequire } from 'node:module'
const require = createRequire('/Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists/frontend/package.json')
const mobileRequire = createRequire('/Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists/frontend/packages/ui-mobile/package.json')
const { default: Vue } = await import(require.resolve('@vitejs/plugin-vue'))
export default {
  root: '/private/tmp/nerv-ui-t04-n04-merger-r2-20261024/probe',
  plugins: [Vue()],
  resolve: { alias: { vue: require.resolve('vue'), '@lucide/vue': mobileRequire.resolve('@lucide/vue'), '@nerv-iip/ui': mobileRequire.resolve('@nerv-iip/ui'), vitest: require.resolve('vitest').replace('index.cjs', 'dist/index.js'), '@vue/test-utils': require.resolve('@vue/test-utils') } },
  test: { environment: 'jsdom', include: ['m1-retract.test.ts'], reporters: ['default', 'json'], outputFile: '/tmp/nerv-ui-t04-n04-merger-r2-20261024/raw/m1-retract.json' }
}
