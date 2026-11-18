<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import * as stylex from '@stylexjs/stylex'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { darkTheme } from './gen/tokens.stylex'
import { darkTheme as desktopDark } from '@nerv-ui/desktop'
import { darkTheme as mobileDark } from '@nerv-ui/mobile'
import { darkTheme as padDark } from '@nerv-ui/pad'
import { darkTheme as screenDark } from '@nerv-ui/screen'
import { styles } from './docs.styles'
import { focus } from './gen/shared.stylex'

/**
 * 主题真源是 `html.dark`（VitePress 的内联脚本会先于 Vue 按 localStorage +
 * prefers-color-scheme 决定它），页面表面再跟随它挂 StyleX 暗色变量组。
 *
 * 不直接用 `useData().isDark`：该 ref 在本站初始化时恒为 false（外观分支没有
 * 进入 useDark），内置开关因此既改不动内容也改不动 html，用它会把导航/正文
 * 拆成两种主题。四个形态包各自持有独立变量组，暗色类必须四包 + 本站一起挂。
 */
const { Layout } = DefaultTheme

const htmlDark = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

const dark = ref(false)
let observer: MutationObserver | undefined

onMounted(() => {
  // 初值必须是 false（与 SSR 产物一致），挂载后再同步真实状态：
  // 直接把 setup 初值设成 html 的状态会让 hydration 认为两边相同、跳过 class 补齐，
  // 结果是导航已是暗色而正文外壳还停在亮色。
  dark.value = htmlDark()
  observer = new MutationObserver(() => {
    dark.value = htmlDark()
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
onBeforeUnmount(() => observer?.disconnect())

const sx = stylex.props(styles.page)
const toggleSx = stylex.props(styles.toggle, focus.subtle)
const darkSx = stylex.props(darkTheme, desktopDark, mobileDark, padDark, screenDark)

function toggleDark() {
  const next = !dark.value
  dark.value = next
  document.documentElement.classList.toggle('dark', next)
  try {
    localStorage.setItem('vitepress-theme-appearance', next ? 'dark' : 'light')
  } catch {
    /* 隐私模式禁用存储时忽略，html.classList 仍是真源 */
  }
}
</script>

<template>
  <div :class="[sx.className, dark && darkSx.className]" :style="sx.style">
    <Layout>
      <template #nav-bar-content-after>
        <button
          type="button"
          class="nx-theme-toggle"
          :class="toggleSx.className"
          :style="toggleSx.style"
          :aria-label="dark ? '切换亮色' : '切换暗色'"
          :aria-pressed="dark"
          @click="toggleDark"
        >
          {{ dark ? '☀' : '☾' }}
        </button>
      </template>
    </Layout>
  </div>
</template>

<style>
/* 内置外观开关依赖 isDark（本站初始化时恒 false，见上），隐藏后只保留一个入口。
   VitePress 用自己的 scoped 规则 `.VPSwitch[data-v-…]`（0,2,0）声明 display，
   这里必须用 !important 才能压过它。 */
.VPSwitchAppearance {
  display: none !important;
}
.nx-theme-toggle {
  margin-left: 8px;
}
</style>
