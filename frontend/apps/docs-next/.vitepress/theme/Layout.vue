<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import * as stylex from '@stylexjs/stylex'
import { ref } from 'vue'
import { darkTheme } from './gen/tokens.stylex'
import { darkTheme as desktopDark } from '@nerv-ui/desktop'
import { styles } from './docs.styles'
import { focus } from './gen/shared.stylex'

const { Layout } = DefaultTheme
const dark = ref(false)
const sx = stylex.props(styles.page)
const toggleSx = stylex.props(styles.toggle, focus.subtle)
const darkSx = stylex.props(darkTheme, desktopDark)
</script>

<template>
  <div :class="[sx.className, dark && darkSx.className]" :style="sx.style">
    <Layout>
      <template #nav-bar-content-after>
        <button type="button" :class="toggleSx.className" :aria-label="dark ? '切换亮色' : '切换暗色'" @click="dark = !dark">
          {{ dark ? '☀' : '☾' }}
        </button>
      </template>
    </Layout>
  </div>
</template>
