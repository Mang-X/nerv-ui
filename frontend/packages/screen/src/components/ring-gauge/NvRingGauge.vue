<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './RingGauge.styles'
import type { RingGaugeTone } from './types'

const props = withDefaults(
  defineProps<{
    value: number
    max?: number
    size?: number
    thickness?: number
    tone?: RingGaugeTone
    label?: string
    unit?: string
    showValue?: boolean
    ariaLabel?: string
  }>(),
  { max: 100, size: 180, thickness: 14, tone: 'accent', showValue: true },
)

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.thickness) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const ratio = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(1, Math.max(0, props.value / props.max))
})
const dash = computed(() => circumference.value * ratio.value)
const clampedValue = computed(() => Math.min(props.max, Math.max(0, props.value)))
const displayValue = computed(() =>
  Number.isInteger(props.value) ? String(props.value) : props.value.toFixed(1),
)
const rootSx = computed(() => stylex.props(styles.root))
const ringSx = computed(() =>
  stylex.props(styles.ring, props.tone === 'accent' ? null : styles[props.tone]),
)
const ariaText = computed(
  () => `${props.label ? `${props.label} ` : ''}${displayValue.value}${props.unit ?? ''}`.trim(),
)
</script>

<template>
  <div
    role="progressbar"
    :aria-label="ariaLabel ?? label ?? '指标'"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="clampedValue"
    :aria-valuetext="ariaText"
    :class="rootSx.className"
    :style="[rootSx.style, { width: `${size}px`, height: `${size}px` }]"
  >
    <svg
      :class="stylex.props(styles.svg).className"
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        :class="stylex.props(styles.track).className"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="thickness"
      />
      <circle
        :class="ringSx.className"
        :style="ringSx.style"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="thickness"
        :stroke-dasharray="`${dash} ${circumference}`"
        :transform="`rotate(-90 ${center} ${center})`"
      />
    </svg>
    <div :class="stylex.props(styles.center).className">
      <span v-if="showValue" :class="stylex.props(styles.value).className">{{ displayValue }}</span>
      <span v-if="unit" :class="stylex.props(styles.unit).className">{{ unit }}</span>
      <span v-if="label" :class="stylex.props(styles.label).className">{{ label }}</span>
    </div>
  </div>
</template>
