<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './TechFrame.styles'
import type { ScreenTechFrameAccent } from './types'

/**
 * 大屏外框：一圈细描边加四个角标；角标颜色由 `accent` 决定。
 */
const props = withDefaults(defineProps<{ accent?: ScreenTechFrameAccent }>(), { accent: 'cyan' })

// 显式映射，不做字符串拼键——拼出来的 key 类型不是 `styles` 的索引，
// 类型检查会退化到 any，改个 tone 名也不会有人报。
const TONE = {
  cyan: styles.cornerCyan,
  green: styles.cornerGreen,
  amber: styles.cornerAmber,
  red: styles.cornerRed,
} as const

const rootSx = computed(() => stylex.props(styles.root))
const cornerSx = computed(() => stylex.props(styles.corner, TONE[props.accent]))

const CORNERS = [
  { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
] as const
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style">
    <slot />
    <span
      v-for="(pos, i) in CORNERS"
      :key="i"
      :class="cornerSx.className"
      :style="[cornerSx.style, pos]"
    />
  </div>
</template>
