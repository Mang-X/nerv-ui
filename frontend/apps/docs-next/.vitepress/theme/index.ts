import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import '@nerv-ui/desktop/styles.css'
import './style.css'

import Demo from './Demo.vue'
import Layout from './Layout.vue'
import Overview from './Overview.vue'
// 桥要在页面渲染前就建好：先建立，组件随后把自己的状态登记进来。
// 只对浏览器构建生效——SSR 阶段没有 document。
import './agent'

export default {
  // 只继承 enhancer 与内置组件，布局整体换成自定义壳（顶栏 / 侧栏 / 目录）。
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Demo', Demo)
    app.component('Overview', Overview)
  },
} satisfies Theme
