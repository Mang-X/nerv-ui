<script setup lang="ts">
import { AlertDialogBackdrop, AlertDialogContent } from '@ui-sdk/vue/alert-dialog'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { glass, overlay, presence } from '../../theme/shared.stylex'
import { styles as dialogStyles } from '../dialog/Dialog.styles'
import { styles } from './AlertDialog.styles'
import type { NvAlertDialogContentProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvAlertDialogContentProps>(), { keepMounted: false })

const backdropSx = computed(() =>
  stylex.props(overlay.backdrop, presence.fade, dialogStyles.backdrop),
)
const contentSx = computed(() =>
  stylex.props(glass.surface, overlay.panel, presence.fadeZoom, dialogStyles.content, styles.content),
)
</script>

<template>
  <AlertDialogBackdrop :class="backdropSx.className" :style="backdropSx.style" />
  <AlertDialogContent
    v-bind="$attrs"
    :keep-mounted="keepMounted"
    :class="[contentSx.className]"
    :style="[contentSx.style]"
  >
    <slot />
  </AlertDialogContent>
</template>
