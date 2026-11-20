<script setup lang="ts">
import { NavigationMenuContent } from '@ui-sdk/vue/navigation-menu'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { glass, presence } from '../../theme/shared.stylex'
import { styles } from './NavigationMenu.styles'
import type { NvNavigationMenuContentProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvNavigationMenuContentProps>(), {
  side: 'bottom',
  align: 'start',
  sideOffset: 6,
  keepMounted: false,
})

const sx = computed(() => stylex.props(glass.surface, presence.fadeZoom, styles.content))
</script>

<template>
  <NavigationMenuContent
    v-bind="$attrs"
    :side="side"
    :align="align"
    :side-offset="sideOffset"
    :keep-mounted="keepMounted"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </NavigationMenuContent>
</template>
