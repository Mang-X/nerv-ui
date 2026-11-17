<script setup lang="ts">
import { Select } from '@ui-sdk/vue/select'
import type { NvSelectProps, NvSelectModelValue } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvSelectProps>(), { multiple: false, disabled: false, readOnly: false, required: false })

const emit = defineEmits<{
  'update:value': [value: NvSelectModelValue]
  'update:open': [open: boolean]
}>()
</script>

<template>
  <Select
    v-bind="$attrs"
    :value="value"
    :default-value="defaultValue"
    :multiple="multiple"
    :open="open"
    :default-open="defaultOpen"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :name="name"
    :placeholder="placeholder"
    :items="items"
    @update:value="emit('update:value', $event as NvSelectModelValue)"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </Select>
</template>
