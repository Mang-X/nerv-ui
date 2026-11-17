<script setup lang="ts">
import { DrawerBackdrop, DrawerContent } from '@ui-sdk/vue/drawer'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { glass, overlay, presence } from '../../theme/shared.stylex'
import { styles } from './Sheet.styles'
import type { NvSheetContentProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvSheetContentProps>(), { keepMounted: false })

const backdropSx = computed(() => stylex.props(overlay.backdrop))
const contentSx = computed(() =>
  stylex.props(glass.surface, overlay.panel, presence.fade, styles.content),
)
</script>

<template>
  <DrawerBackdrop :class="backdropSx.className" :style="backdropSx.style" />
  <DrawerContent
    v-bind="$attrs"
    :keep-mounted="keepMounted"
    :class="[contentSx.className]"
    :style="[contentSx.style]"
  >
    <slot />
  </DrawerContent>
</template>
