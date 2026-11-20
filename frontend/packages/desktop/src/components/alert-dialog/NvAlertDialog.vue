<script setup lang="ts">
import { AlertDialog } from '@ui-sdk/vue/alert-dialog'
import type { NvAlertDialogProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvAlertDialogProps>(), { open: undefined,  defaultOpen: false, dismissible: true })

</script>

<template>
  <AlertDialog
    v-bind="$attrs"
    :open="open"
    :default-open="defaultOpen"
    :dismissible="dismissible"
  >
    <slot />
  </AlertDialog>
</template>
