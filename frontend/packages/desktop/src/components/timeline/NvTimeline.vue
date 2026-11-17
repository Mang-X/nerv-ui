<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Timeline.styles'
import type { NvTimelineProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvTimelineProps>(), { label: '时间线' })

const sx = computed(() => stylex.props(styles.root))
</script>

<template>
  <ul
    v-bind="$attrs"
    :aria-label="label"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </ul>
</template>
