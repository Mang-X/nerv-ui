<script setup lang="ts">
import { Tooltip } from '@ui-sdk/vue/tooltip'
import type { NvTooltipProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvTooltipProps>(), {
  defaultOpen: false,
  disabled: false,
  type: 'description',
})

const emit = defineEmits<{ 'update:open': [open: boolean] }>()
</script>

<template>
  <Tooltip
    v-bind="$attrs"
    :open="open"
    :default-open="defaultOpen"
    :delay="delay"
    :close-delay="closeDelay"
    :disabled="disabled"
    :type="type"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </Tooltip>
</template>
