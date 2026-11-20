<script setup lang="ts">
import { DialogClose } from '@ui-sdk/vue/dialog'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Dialog.styles'
import type { NvDialogCloseProps } from './types'

defineOptions({ inheritAttrs: false })

defineProps<NvDialogCloseProps>()

const sx = computed(() => stylex.props(styles.close, focus.ring))
</script>

<template>
  <DialogClose
    v-bind="$attrs"
    :value="value"
    :action="action"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </DialogClose>
</template>
