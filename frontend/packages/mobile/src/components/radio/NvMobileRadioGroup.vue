<script setup lang="ts">
import { RadioGroup } from '@ui-sdk/vue/radio'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { styles } from './MobileRadio.styles'
import NvMobileRadio from './NvMobileRadio.vue'
import type { MobileRadioOption } from './types'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    defaultValue?: string | null
    options?: MobileRadioOption[]
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    inline?: boolean
    name?: string
    ariaLabel?: string
  }>(),
  {
    modelValue: undefined,
    defaultValue: null,
    options: () => [],
    disabled: false,
    readonly: false,
    required: false,
    inline: false,
    name: undefined,
    ariaLabel: undefined,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const inner = ref<string | null>(props.defaultValue)
const value = computed({
  get: () => (props.modelValue !== undefined ? props.modelValue : inner.value),
  set: (next: string | null) => {
    inner.value = next
    emit('update:modelValue', next)
  },
})
</script>

<template>
  <RadioGroup
    :value="value"
    :disabled="disabled"
    :read-only="readonly"
    :required="required"
    :name="name"
    :aria-label="ariaLabel"
    :class="stylex.props(styles.group, inline && styles.groupInline).className"
    @value-change="value = $event"
  >
    <NvMobileRadio
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :disabled="option.disabled"
      :label="option.label"
    />
    <slot />
  </RadioGroup>
</template>
