<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './ScreenStatusTag.styles'
import type { StatusTagSize, StatusTagTone } from './types'

const props = withDefaults(
  defineProps<{
    tone?: StatusTagTone
    label: string
    size?: StatusTagSize
    /** Show the leading dot. The label itself always carries the state word. */
    dot?: boolean
    /** Square-ish corners instead of the pill, for inline table cells. */
    square?: boolean
  }>(),
  { tone: 'default', size: 'md', dot: true, square: false },
)

const sizeStyles = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const

const toneStyles = {
  accent: styles.toneAccent,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
} as const

const dotTones = {
  accent: styles.dotAccent,
  success: styles.dotSuccess,
  warning: styles.dotWarning,
  danger: styles.dotDanger,
} as const

const rootSx = computed(() =>
  stylex.props(
    styles.root,
    sizeStyles[props.size],
    props.tone === 'default' ? null : toneStyles[props.tone],
    props.square && styles.radius,
  ),
)
const labelSx = computed(() =>
  stylex.props(styles.label, props.tone === 'default' ? styles.textDefault : null),
)
const dotSx = computed(() =>
  stylex.props(styles.dot, props.tone === 'default' ? styles.dot : dotTones[props.tone]),
)
</script>

<template>
  <span :class="rootSx.className" :style="rootSx.style">
    <span v-if="dot" :class="dotSx.className" :style="dotSx.style" aria-hidden="true" />
    <span :class="labelSx.className" :style="labelSx.style">{{ label }}</span>
  </span>
</template>
