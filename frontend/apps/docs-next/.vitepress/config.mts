import { defineConfig } from 'vitepress'
import stylex from '@stylexjs/unplugin/vite'

export default defineConfig({
  title: 'NvUI',
  description: 'NvUI 组件库文档',
  vite: {
    plugins: [stylex({ classNamePrefix: 'nx' })],
  },
  themeConfig: {
    nav: [{ text: '组件', link: '/components/button' }],
    sidebar: [
      {
        text: '通用',
        items: [{ text: 'NvButton 按钮', link: '/components/button' }],
      },
    ],
  },
})
