<script setup lang="ts">
import { DrawerClose } from '@ui-sdk/vue/drawer'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles as dialogStyles } from '../dialog/Dialog.styles'
import type { NvSheetCloseProps } from './types'

defineOptions({ inheritAttrs: false })

defineProps<NvSheetCloseProps>()

const sx = computed(() => stylex.props(dialogStyles.close, focus.ring))
</script>

<template>
  <DrawerClose
    v-bind="$attrs"
    :value="value"
    :action="action"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </DrawerClose>
</template>
