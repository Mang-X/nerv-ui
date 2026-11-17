<script setup lang="ts">
import { AlertDialogClose } from '@ui-sdk/vue/alert-dialog'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles as dialogStyles } from '../dialog/Dialog.styles'
import type { NvAlertDialogCloseProps } from './types'

defineOptions({ inheritAttrs: false })

defineProps<NvAlertDialogCloseProps>()

const sx = computed(() => stylex.props(dialogStyles.close, focus.ring))
</script>

<template>
  <AlertDialogClose
    v-bind="$attrs"
    :value="value"
    :action="action"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </AlertDialogClose>
</template>
