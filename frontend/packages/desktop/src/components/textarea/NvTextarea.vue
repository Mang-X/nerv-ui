<script setup lang="ts">
import { Textarea } from '@ui-sdk/vue/textarea'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Textarea.styles'
import type { NvTextareaProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvTextareaProps>(), {
  disabled: false,
  readOnly: false,
  required: false,
  invalid: false,
  autoResize: false,
  rows: 3,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const sx = computed(() =>
  stylex.props(
    styles.root,
    focus.ring,
    props.autoResize && styles.autoResize,
    props.invalid && styles.invalid,
  ),
)
</script>

<template>
  <Textarea
    v-bind="$attrs"
    :model-value="modelValue"
    :default-value="defaultValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :aria-invalid="invalid || undefined"
    :auto-resize="autoResize"
    :rows="rows"
    :class="[sx.className]"
    :style="[sx.style]"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
