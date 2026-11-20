<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, useAttrs } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './TouchBadge.styles'
import type { TouchBadgeProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TouchBadgeProps>(), {
  variant: 'neutral',
  size: 'md',
  dot: false,
  round: false,
})

const attrs = useAttrs()
const forwardedAttrs = computed(() => omitClassStyle(attrs))
const rootSx = computed(() =>
  stylex.props(styles.root, styles[props.variant], styles[props.size], props.round && styles.round),
)
const dotSx = computed(() => stylex.props(styles.dot))
</script>

<template>
  <span
    v-bind="forwardedAttrs"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <span v-if="dot" :class="dotSx.className" :style="dotSx.style" aria-hidden="true" />
    <slot />
  </span>
</template>
