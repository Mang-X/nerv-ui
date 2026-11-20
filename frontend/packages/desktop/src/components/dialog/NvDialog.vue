<script setup lang="ts">
import { Dialog } from '@ui-sdk/vue/dialog'
import type { NvDialogProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvDialogProps>(), { open: undefined, 
  defaultOpen: false,
  modal: true,
  dismissible: true,
  closeOnOutsidePress: true,
})

</script>

<template>
  <Dialog
    v-bind="$attrs"
    :open="open"
    :default-open="defaultOpen"
    :modal="modal"
    :dismissible="dismissible"
    :close-on-outside-press="closeOnOutsidePress"
  >
    <slot />
  </Dialog>
</template>
