<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Skeleton.styles'
import type { MobileSkeletonProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileSkeletonProps>(), {
  shape: 'rect',
  width: undefined,
  height: undefined,
  animation: 'pulse',
  lines: 3,
  label: undefined,
})

const lineCount = computed(() => Math.max(props.lines, 1))
const multipleLines = computed(() => props.shape === 'text' && lineCount.value > 1)

const defaults = computed(() => {
  if (props.shape === 'circle') return { width: 48, height: 48 }
  if (props.shape === 'text') return { width: '100%', height: 14 }
  return { width: '100%', height: 96 }
})

const boxSx = computed(() =>
  stylex.props(styles.base, styles[props.shape], props.animation === 'pulse' && styles.animated),
)

const sizeStyle = computed(() => ({
  width: cssSize(props.width ?? defaults.value.width),
  height: cssSize(props.height ?? defaults.value.height),
}))

function cssSize(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value
}
</script>

<template>
  <div
    v-if="multipleLines"
    v-bind="$attrs"
    :role="label ? 'status' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    :class="[stylex.props(styles.lines).className, $attrs.class]"
    :style="[stylex.props(styles.lines).style, $attrs.style]"
  >
    <div
      v-for="line in lineCount"
      :key="line"
      aria-hidden="true"
      :class="boxSx.className"
      :style="[boxSx.style, sizeStyle, line === lineCount ? { width: '70%' } : { width: '100%' }]"
    />
  </div>
  <div
    v-else
    v-bind="$attrs"
    :role="label ? 'status' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    :class="[boxSx.className, $attrs.class]"
    :style="[boxSx.style, sizeStyle, $attrs.style]"
  />
</template>
