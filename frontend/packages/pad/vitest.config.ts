import Vue from '@vitejs/plugin-vue'
import stylex from '@stylexjs/unplugin/vite'
import { defineConfig } from 'vitest/config'

/**
 * 组件测试配置：jsdom + StyleX 编译。
 *
 * StyleX 必须真的编译，不能靠运行时兜底——`stylex.create` 在未编译时会直接抛
 * "Styles must be compiled by '@stylexjs/babel-plugin'"，所以这里挂的是构建期
 * 用的同一个 unplugin。测试只断言结构、语义和代理桥，不读计算样式，因此生成的
 * 原子类叫什么并不重要。
 */
export default defineConfig({
  plugins: [Vue(), stylex({ classNamePrefix: 'nx' })],
  resolve: { dedupe: ['vue'] },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
