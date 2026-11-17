<script setup lang="ts">
import { AlertDialogTrigger } from '@ui-sdk/vue/alert-dialog'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles as dialogStyles } from '../dialog/Dialog.styles'
import type { NvAlertDialogTriggerProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvAlertDialogTriggerProps>(), {
  disabled: false,
  focusableWhenDisabled: false,
})

const sx = computed(() => stylex.props(dialogStyles.trigger, focus.ring))
</script>

<template>
  <AlertDialogTrigger
    v-bind="$attrs"
    :disabled="disabled"
    :focusable-when-disabled="focusableWhenDisabled"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </AlertDialogTrigger>
</template>
