<script setup lang="ts">
import { PopoverTrigger } from '@ui-sdk/vue/popover'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles as dialogStyles } from '../dialog/Dialog.styles'
import type { NvPopoverTriggerProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvPopoverTriggerProps>(), {
  disabled: false,
  focusableWhenDisabled: false,
})

const sx = computed(() => stylex.props(dialogStyles.trigger, focus.ring))
</script>

<template>
  <PopoverTrigger
    v-bind="$attrs"
    :disabled="disabled"
    :focusable-when-disabled="focusableWhenDisabled"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </PopoverTrigger>
</template>
