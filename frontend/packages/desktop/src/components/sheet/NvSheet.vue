<script setup lang="ts">
import { Drawer } from '@ui-sdk/vue/drawer'
import type { NvSheetProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvSheetProps>(), { open: undefined, 
  defaultOpen: false,
  side: 'right',
  modal: true,
  dismissible: true,
})

</script>

<template>
  <Drawer
    v-bind="$attrs"
    :open="open"
    :default-open="defaultOpen"
    :side="side"
    :modal="modal"
    :dismissible="dismissible"
  >
    <slot />
  </Drawer>
</template>
