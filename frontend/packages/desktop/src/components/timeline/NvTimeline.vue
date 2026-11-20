<script setup lang="ts">
import { Timeline } from '@ui-sdk/vue/timeline'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Timeline.styles'
import type { NvTimelineProps } from './types'

// The primitive owns role=list and the roving tab stop: one event is focusable,
// arrow keys move between the rest. The wrapper only names it.
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvTimelineProps>(), { label: '时间线' })

const sx = computed(() => stylex.props(styles.root))
</script>

<template>
  <Timeline
    v-bind="$attrs"
    :aria-label="label"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </Timeline>
</template>
