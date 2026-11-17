<script setup lang="ts">
import { PopoverContent } from '@ui-sdk/vue/popover'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { glass, overlay, presence } from '../../theme/shared.stylex'
import { styles } from './Popover.styles'
import type { NvPopoverContentProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvPopoverContentProps>(), {
  side: 'bottom',
  align: 'center',
})

const sx = computed(() =>
  stylex.props(glass.surface, overlay.panel, presence.fadeZoom, styles.content),
)
</script>

<template>
  <PopoverContent
    v-bind="$attrs"
    :side="side"
    :align="align"
    :side-offset="sideOffset ?? 6"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </PopoverContent>
</template>
