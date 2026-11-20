<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Freshness.styles'
import type { ScreenFreshnessTone } from './types'

/**
 * 大屏数据新鲜度的视觉边界。`role="status"` 让读屏在文案变化时播报；
 * 颜色只是辅助，文字始终在场。
 */
const props = withDefaults(defineProps<{ tone?: ScreenFreshnessTone; label: string }>(), {
  tone: 'wait',
})

const TONE = {
  live: { text: styles.live, dot: styles.liveDot },
  stale: { text: styles.stale, dot: styles.staleDot },
  wait: { text: styles.wait, dot: styles.waitDot },
} as const

const sx = computed(() => {
  const tone = TONE[props.tone]
  return {
    root: stylex.props(styles.root, tone.text),
    dot: stylex.props(styles.dot, tone.dot),
  }
})
</script>

<template>
  <span :class="sx.root.className" :style="sx.root.style" role="status" aria-atomic="true">
    <i :class="sx.dot.className" :style="sx.dot.style" aria-hidden="true" />
    <span>{{ props.label }}</span>
  </span>
</template>
