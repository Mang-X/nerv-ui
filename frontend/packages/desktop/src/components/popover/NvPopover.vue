<script setup lang="ts">
import { Popover } from '@ui-sdk/vue/popover'
import type { NvPopoverProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvPopoverProps>(), {
  defaultOpen: false,
  modal: false,
  openOnHover: false,
})

const emit = defineEmits<{ 'update:open': [open: boolean] }>()
</script>

<template>
  <Popover
    v-bind="$attrs"
    :open="open"
    :default-open="defaultOpen"
    :modal="modal"
    :open-on-hover="openOnHover"
    :delay="delay"
    :close-delay="closeDelay"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </Popover>
</template>
