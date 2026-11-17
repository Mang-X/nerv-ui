<script setup lang="ts">
import { AlertDialog } from '@ui-sdk/vue/alert-dialog'
import type { NvAlertDialogProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvAlertDialogProps>(), { defaultOpen: false, dismissible: true })

const emit = defineEmits<{ 'update:open': [open: boolean] }>()
</script>

<template>
  <AlertDialog
    v-bind="$attrs"
    :open="open"
    :default-open="defaultOpen"
    :dismissible="dismissible"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </AlertDialog>
</template>
