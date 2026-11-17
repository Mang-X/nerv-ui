<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Card.styles'
import type { NvCardProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvCardProps>(), { variant: 'outline' })

const sx = computed(() => stylex.props(styles.root, styles[props.variant]))
</script>

<template>
  <div v-bind="$attrs" :class="[sx.className, $attrs.class]" :style="[sx.style, $attrs.style]">
    <slot />
  </div>
</template>
