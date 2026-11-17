<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Skeleton.styles'
import type { NvSkeletonProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvSkeletonProps>(), {
  shape: 'rect',
  animation: 'pulse',
  lines: 3,
  label: undefined,
})

const multipleLines = computed(() => props.shape === 'text' && Math.max(props.lines, 1) > 1)
const lineCount = computed(() => Math.max(props.lines, 1))

const defaults = computed(() => {
  if (props.shape === 'circle') return { width: 40, height: 40 }
  if (props.shape === 'text') return { width: '100%', height: 12 }
  return { width: '100%', height: 96 }
})

const boxSx = computed(() =>
  stylex.props(styles.base, styles[props.shape], props.animation === 'pulse' && styles.animated),
)

const linesSx = computed(() => stylex.props(styles.lines))

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
    :class="[linesSx.className, $attrs.class]"
    :style="[linesSx.style, $attrs.style]"
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
