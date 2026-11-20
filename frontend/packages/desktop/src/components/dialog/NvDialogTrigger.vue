<script setup lang="ts">
import { DialogTrigger } from '@ui-sdk/vue/dialog'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Dialog.styles'
import type { NvDialogTriggerProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvDialogTriggerProps>(), {
  disabled: false,
  focusableWhenDisabled: false,
})

const sx = computed(() => stylex.props(styles.trigger, focus.ring))
</script>

<template>
  <DialogTrigger
    v-bind="$attrs"
    :disabled="disabled"
    :focusable-when-disabled="focusableWhenDisabled"
    :class="[sx.className]"
    :style="[sx.style]"
  >
    <slot />
  </DialogTrigger>
</template>
