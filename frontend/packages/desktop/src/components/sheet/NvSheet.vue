<script setup lang="ts">
import { Drawer } from '@ui-sdk/vue/drawer'
import type { NvSheetProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvSheetProps>(), {
  defaultOpen: false,
  side: 'right',
  modal: true,
  dismissible: true,
})

const emit = defineEmits<{ 'update:open': [open: boolean] }>()
</script>

<template>
  <Drawer
    v-bind="$attrs"
    :open="open"
    :default-open="defaultOpen"
    :side="side"
    :modal="modal"
    :dismissible="dismissible"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </Drawer>
</template>
