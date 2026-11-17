<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Badge.styles'
import type { NvBadgeProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvBadgeProps>(), {
  variant: 'neutral',
  size: 'sm',
  dot: false,
  round: false,
})

const sx = computed(() =>
  stylex.props(styles.root, styles[props.variant], styles[props.size], props.round && styles.round),
)
const dotSx = computed(() => stylex.props(styles.dot))
</script>

<template>
  <span v-bind="$attrs" :class="[sx.className, $attrs.class]" :style="[sx.style, $attrs.style]">
    <span v-if="dot" :class="dotSx.className" :style="dotSx.style" aria-hidden="true" />
    <slot />
  </span>
</template>
