<script setup lang="ts">
import { DialogBackdrop, DialogContent } from '@ui-sdk/vue/dialog'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { glass, overlay, presence } from '../../theme/shared.stylex'
import { styles } from './Dialog.styles'
import type { NvDialogContentProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvDialogContentProps>(), { keepMounted: false })

const backdropSx = computed(() => stylex.props(overlay.backdrop, presence.fade, styles.backdrop))
const contentSx = computed(() =>
  stylex.props(glass.surface, overlay.panel, presence.fadeZoom, styles.content),
)
</script>

<template>
  <DialogBackdrop :class="backdropSx.className" :style="backdropSx.style" />
  <DialogContent
    v-bind="$attrs"
    :keep-mounted="keepMounted"
    :class="[contentSx.className]"
    :style="[contentSx.style]"
  >
    <slot />
  </DialogContent>
</template>
