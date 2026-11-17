<script setup lang="ts">
import { LoaderCircleIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Spinner.styles'
import type { NvSpinnerProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvSpinnerProps>(), {
  size: 'md',
  label: '加载中',
  decorative: false,
})

const iconSize = computed(() => ({ sm: 16, md: 20, lg: 28 })[props.size])
const sx = computed(() => stylex.props(styles.root))
</script>

<template>
  <span
    v-bind="$attrs"
    :role="decorative ? undefined : 'status'"
    :aria-label="decorative ? undefined : label"
    :aria-hidden="decorative || undefined"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <LoaderCircleIcon :size="iconSize" aria-hidden="true" />
  </span>
</template>
