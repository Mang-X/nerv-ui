<script setup lang="ts">
import { Input, InputClear, InputGroup } from '@ui-sdk/vue/input'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Input.styles'
import type { NvInputProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvInputProps>(), {
  type: 'text',
  disabled: false,
  readOnly: false,
  required: false,
  invalid: false,
  clearable: false,
  clearLabel: '清除',
  size: 'md',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const groupSx = computed(() =>
  stylex.props(styles.group, focus.ring, styles[props.size], props.invalid && styles.invalid),
)
const inputSx = computed(() => stylex.props(styles.input))
const affixSx = computed(() => stylex.props(styles.affix))
const clearSx = computed(() => stylex.props(styles.clear, focus.subtle))
</script>

<template>
  <InputGroup
    :class="[groupSx.className, $attrs.class]"
    :style="[groupSx.style, $attrs.style]"
  >
    <span v-if="$slots.prefix" :class="affixSx.className" :style="affixSx.style">
      <slot name="prefix" />
    </span>
    <Input
      v-bind="omitClassStyle($attrs)"
      :type="type"
      :model-value="modelValue"
      :default-value="defaultValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :read-only="readOnly"
      :required="required"
      :aria-invalid="invalid || undefined"
      :class="inputSx.className"
      :style="inputSx.style"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <span v-if="$slots.suffix" :class="affixSx.className" :style="affixSx.style">
      <slot name="suffix" />
    </span>
    <InputClear
      v-if="clearable"
      :aria-label="clearLabel"
      :class="clearSx.className"
      :style="clearSx.style"
    >
      <NvIcon name="close" :size="14" />
    </InputClear>
  </InputGroup>
</template>
