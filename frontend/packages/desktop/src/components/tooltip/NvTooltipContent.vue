<script setup lang="ts">
import { TooltipContent } from '@ui-sdk/vue/tooltip'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { glass, overlay, presence } from '../../theme/shared.stylex'
import { styles } from './Tooltip.styles'
import type { NvTooltipContentProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvTooltipContentProps>(), {
  side: 'top',
  align: 'center',
})

const sx = computed(() =>
  stylex.props(glass.surface, overlay.panel, presence.fade, styles.content),
)
</script>

<template>
  <TooltipContent
    v-bind="$attrs"
    :side="side"
    :align="align"
    :side-offset="sideOffset ?? 6"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </TooltipContent>
</template>
