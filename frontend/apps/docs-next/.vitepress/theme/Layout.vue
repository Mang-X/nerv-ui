<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { Content, useData } from 'vitepress'
import { NvBadge, NvButton, NvSheet, NvSheetContent } from '@nerv-ui/desktop'
import * as stylex from '@stylexjs/stylex'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { darkTheme } from './gen/tokens.stylex'
import { darkTheme as desktopDark } from '@nerv-ui/desktop'
import { darkTheme as mobileDark } from '@nerv-ui/mobile'
import { darkTheme as padDark } from '@nerv-ui/pad'
import { darkTheme as screenDark } from '@nerv-ui/screen'
import { styles } from './layout.styles'
import DocsSidebar from './DocsSidebar.vue'

/**
 * 自定义布局：顶栏与侧栏全部由 @nerv-ui/desktop 组件 + StyleX 变量绘制，
 * 不再使用 VitePress 默认主题的 VPNav / VPSidebar。markdown 正文仍由
 * VitePress 的 <Content/> 渲染（保留 .vp-doc 的排版与代码高亮样式）。
 *
 * 主题真源是 `html.dark`：VitePress 的内联脚本先于 Vue 按 localStorage +
 * prefers-color-scheme 决定它，这里只跟随，并把四形态包的暗色变量组一起挂上
 * （每个包持有独立变量组，缺一个就有一类组件不变色）。
 */
const { page, theme, frontmatter } = useData()

const htmlDark = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

const dark = ref(false)
let observer: MutationObserver | undefined

onMounted(() => {
  // 初值 false 与 SSR 产物一致，挂载后再同步真实状态，避免 hydration 跳过 class 补齐。
  dark.value = htmlDark()
  observer = new MutationObserver(() => {
    dark.value = htmlDark()
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
onBeforeUnmount(() => observer?.disconnect())

const s = {
  shell: stylex.props(styles.shell),
  nav: stylex.props(styles.nav),
  brand: stylex.props(styles.brand),
  brandDot: stylex.props(styles.brandDot),
  navLink: stylex.props(styles.navLink),
  navMenuButton: stylex.props(styles.navMenuButton),
  navLinks: stylex.props(styles.navLinks),
  navLinkActive: stylex.props(styles.navLinkActive),
  body: stylex.props(styles.body),
  sidebarAside: stylex.props(styles.sidebarAside),
  main: stylex.props(styles.main),
  article: stylex.props(styles.article),
  outline: stylex.props(styles.outline),
  outlineTitle: stylex.props(styles.outlineTitle),
  outlineLink: stylex.props(styles.outlineLink),
  outlineLinkIndent: stylex.props(styles.outlineLinkIndent),
  home: stylex.props(styles.home),
  heroName: stylex.props(styles.heroName),
  heroText: stylex.props(styles.heroText),
  heroTagline: stylex.props(styles.heroTagline),
  heroActions: stylex.props(styles.heroActions),
  cta: stylex.props(styles.cta),
  drawerPanel: stylex.props(styles.drawerPanel),
}

const darkSx = stylex.props(darkTheme, desktopDark, mobileDark, padDark, screenDark)

const isHome = computed(() => frontmatter.value.layout === 'home')
const hero = computed(() => frontmatter.value.hero ?? {})
const actions = computed(() => (hero.value.actions ?? []) as Array<{ text: string; link: string }>)
const navLinks = computed(
  () => (theme.value.nav ?? []) as Array<{ text: string; link: string }>,
)
// VitePress 的 headers 是层级的（h3 挂在 h2 的 children 下），目录要摊平后按层缩进。
const outline = computed(() => {
  type Header = { level: number; title: string; link: string; children?: Header[] }
  const flat: Array<Header & { depth: number }> = []
  const walk = (list: Header[], depth: number) => {
    for (const header of list) {
      flat.push({ ...header, depth })
      if (header.children?.length) walk(header.children, depth + 1)
    }
  }
  walk((page.value.headers ?? []) as Header[], 0)
  return flat.slice(0, 24)
})

function currentPath() {
  const path = page.value.relativePath.replace(/\.md$/, '')
  return path === 'index' ? '/' : `/${path}`
}

function isActiveNav(link: string) {
  return link.replace(/\.html$/, '') === currentPath()
}

const menuOpen = ref(false)
// 路由变化（尤其从抽屉里点了链接）后必须收起抽屉，否则它挡住新页面。
watch(() => page.value.relativePath, () => (menuOpen.value = false))

function toggleDark() {
  const next = !dark.value
  dark.value = next
  document.documentElement.classList.toggle('dark', next)
  try {
    localStorage.setItem('vitepress-theme-appearance', next ? 'dark' : 'light')
  } catch {
    /* 隐私模式下写入失败时，html.classList 仍是真源 */
  }
}
</script>

<template>
  <div :class="[s.shell.className, dark && darkSx.className]" :style="s.shell.style">
    <header :class="s.nav.className" :style="s.nav.style">
      <button
        type="button"
        :class="[s.navMenuButton.className]"
        :style="s.navMenuButton.style"
        aria-label="打开组件导航"
        @click="menuOpen = true"
      >
        ☰
      </button>
      <a href="/" :class="s.brand.className" :style="s.brand.style">
        <span :class="s.brandDot.className" :style="s.brandDot.style">Nv</span>UI
        <NvBadge variant="outline" size="sm">beta</NvBadge>
      </a>
      <nav aria-label="顶部导航" :class="[s.navLinks.className]" :style="s.navLinks.style">
        <a
          v-for="item in navLinks"
          :key="item.link"
          :href="item.link"
          :class="[s.navLink.className, isActiveNav(item.link) && s.navLinkActive.className]"
          :style="s.navLink.style"
          :aria-current="isActiveNav(item.link) ? 'page' : undefined"
        >
          {{ item.text }}
        </a>
      </nav>
      <NvButton
        variant="ghost"
        size="sm"
        :aria-label="dark ? '切换亮色' : '切换暗色'"
        :aria-pressed="dark"
        @click="toggleDark"
      >
        {{ dark ? '☀' : '☾' }}
      </NvButton>
    </header>

    <div v-if="isHome" :class="s.home.className" :style="s.home.style">
      <div :class="s.heroName.className" :style="s.heroName.style">{{ hero.name ?? 'NvUI' }}</div>
      <div :class="s.heroText.className" :style="s.heroText.style">{{ hero.text }}</div>
      <p :class="s.heroTagline.className" :style="s.heroTagline.style">{{ hero.tagline }}</p>
      <div :class="s.heroActions.className" :style="s.heroActions.style">
        <a v-for="action in actions" :key="action.link" :href="action.link" :class="s.cta.className" :style="s.cta.style">
          {{ action.text }}
        </a>
      </div>
    </div>

    <div v-else :class="s.body.className" :style="s.body.style">
      <aside :class="s.sidebarAside.className" :style="s.sidebarAside.style">
        <DocsSidebar />
      </aside>
      <div :class="s.main.className" :style="s.main.style">
        <div :class="[s.article.className, 'vp-doc']" :style="s.article.style">
          <Content />
        </div>
        <aside v-if="outline.length" :class="s.outline.className" :style="s.outline.style" aria-label="本页目录">
          <div :class="s.outlineTitle.className" :style="s.outlineTitle.style">本页目录</div>
          <a
            v-for="item in outline"
            :key="item.link"
            :href="item.link"
            :class="s.outlineLink.className"
            :style="[s.outlineLink.style, item.depth > 0 && s.outlineLinkIndent.style]"
          >
            {{ item.title }}
          </a>
        </aside>
      </div>
    </div>

    <NvSheet side="left" :open="menuOpen" @update:open="menuOpen = $event">
      <NvSheetContent :class="[s.drawerPanel.className, dark && darkSx.className]" :style="s.drawerPanel.style">
        <DocsSidebar />
      </NvSheetContent>
    </NvSheet>
  </div>
</template>
