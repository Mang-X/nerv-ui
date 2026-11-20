<script setup lang="ts">
import { MenuSubContent } from '@ui-sdk/vue/menu'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { overlay, presence } from '../../theme/shared.stylex'
import { styles } from './DropdownMenu.styles'
import type { NvDropdownMenuSubContentProps } from './types'

defineOptions({ inheritAttrs: false })

defineProps<NvDropdownMenuSubContentProps>()

const sx = computed(() => stylex.props(overlay.panel, presence.fadeZoom, styles.content))
</script>

<template>
  <MenuSubContent :class="[sx.className, $attrs.class]" :style="[sx.style, $attrs.style]" v-bind="$attrs">
    <slot />
  </MenuSubContent>
</template>
