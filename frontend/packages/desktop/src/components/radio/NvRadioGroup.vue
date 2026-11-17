<script setup lang="ts">
import { RadioGroup } from '@ui-sdk/vue/radio'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Radio.styles'
import type { NvRadioGroupProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvRadioGroupProps>(), {
  disabled: false,
  readOnly: false,
  required: false,
})

const emit = defineEmits<{ 'update:value': [value: string | null] }>()

const sx = computed(() => stylex.props(styles.group))
</script>

<template>
  <RadioGroup
    v-bind="$attrs"
    :value="value"
    :default-value="defaultValue"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :name="name"
    :class="[sx.className]"
    :style="[sx.style]"
    @update:value="emit('update:value', $event)"
  >
    <slot />
  </RadioGroup>
</template>
