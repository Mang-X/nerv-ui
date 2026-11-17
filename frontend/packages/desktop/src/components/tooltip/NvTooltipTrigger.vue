<script setup lang="ts">
import { TooltipTrigger } from '@ui-sdk/vue/tooltip'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Tooltip.styles'
import type { NvTooltipTriggerProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvTooltipTriggerProps>(), { disabled: false })

const sx = computed(() => stylex.props(styles.trigger, focus.ring))
</script>

<template>
  <TooltipTrigger
    v-bind="$attrs"
    :disabled="disabled"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </TooltipTrigger>
</template>
