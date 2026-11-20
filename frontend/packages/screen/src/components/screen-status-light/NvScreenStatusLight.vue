<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './ScreenStatusLight.styles'
import type { StatusLightSize, StatusLightTone } from './types'

const props = withDefaults(
  defineProps<{
    tone?: StatusLightTone
    label?: string
    size?: StatusLightSize
    /** Turn the breathing animation off, e.g. in dense lists. */
    static?: boolean
  }>(),
  { tone: 'default', size: 'md', static: false },
)

const sizeStyles = {
  sm: { dot: styles.sizeSm, label: styles.labelSm },
  md: { dot: styles.sizeMd, label: styles.labelMd },
  lg: { dot: styles.sizeLg, label: styles.labelLg },
} as const

const dotTones = {
  accent: styles.dotAccent,
  success: styles.dotSuccess,
  warning: styles.dotWarning,
  danger: styles.dotDanger,
} as const

const textTones = {
  default: styles.textDefault,
  accent: styles.textAccent,
  success: styles.textSuccess,
  warning: styles.textWarning,
  danger: styles.textDanger,
} as const

const rootSx = computed(() => stylex.props(styles.root))
const dotSx = computed(() =>
  stylex.props(
    styles.dot,
    styles.transition,
    sizeStyles[props.size].dot,
    props.tone === 'default' ? null : dotTones[props.tone],
    props.static && styles.pulseOff,
  ),
)
const labelSx = computed(() =>
  stylex.props(styles.label, styles.transition, sizeStyles[props.size].label, textTones[props.tone]),
)
</script>

<template>
  <span :class="rootSx.className" :style="rootSx.style" role="status">
    <span :class="dotSx.className" :style="dotSx.style" aria-hidden="true" />
    <span v-if="label" :class="labelSx.className" :style="labelSx.style">{{ label }}</span>
  </span>
</template>
