<script setup lang="ts">
import { MenuContent } from '@ui-sdk/vue/menu'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { glass, overlay, presence } from '../../theme/shared.stylex'
import { styles } from './DropdownMenu.styles'
import type { NvDropdownMenuContentProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvDropdownMenuContentProps>(), {
  side: 'bottom',
  align: 'start',
})

const sx = computed(() => stylex.props(overlay.panel, presence.fadeZoom, styles.content))
</script>

<template>
  <MenuContent
    v-bind="$attrs"
    :side="side"
    :align="align"
    :side-offset="sideOffset ?? 4"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style, minWidth ? { minWidth: `${minWidth}px` } : undefined]"
  >
    <slot />
  </MenuContent>
</template>
