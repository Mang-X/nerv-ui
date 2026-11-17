<script setup lang="ts">
import { DrawerTrigger } from '@ui-sdk/vue/drawer'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles as dialogStyles } from '../dialog/Dialog.styles'
import type { NvSheetTriggerProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvSheetTriggerProps>(), {
  disabled: false,
  focusableWhenDisabled: false,
})

const sx = computed(() => stylex.props(dialogStyles.trigger, focus.ring))
</script>

<template>
  <DrawerTrigger
    v-bind="$attrs"
    :disabled="disabled"
    :focusable-when-disabled="focusableWhenDisabled"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </DrawerTrigger>
</template>
