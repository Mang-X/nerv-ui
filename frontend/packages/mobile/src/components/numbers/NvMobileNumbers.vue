<script setup lang="ts">
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from '@ui-sdk/vue/number-input'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Numbers.styles'
import type { MobileNumbersProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileNumbersProps>(), {
  // Undefined, not false: a numeric default would make the value controlled and
  // the buttons could never change it.
  modelValue: undefined,
  defaultValue: null,
  min: 0,
  max: 9999,
  step: 1,
  largeStep: 10,
  disabled: false,
  readonly: false,
  name: undefined,
  label: undefined,
  incrementLabel: '增加',
  decrementLabel: '减少',
  showDecrement: true,
  showIncrement: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  change: [value: number | null]
}>()

const inner = ref<number | null>(props.defaultValue)

const groupSx = computed(() => stylex.props(styles.group, focus.ring))
const buttonSx = computed(() => stylex.props(styles.button, focus.ring))
const decrementSx = computed(() =>
  stylex.props(styles.button, styles.buttonDecrement, focus.ring),
)
const incrementSx = computed(() =>
  stylex.props(styles.button, styles.buttonIncrement, focus.ring),
)

function onValueChange(value: number | null) {
  inner.value = value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <NumberInput
    v-bind="$attrs"
    :value="modelValue"
    :default-value="defaultValue"
    :min="min"
    :max="max"
    :step="step"
    :large-step="largeStep"
    :disabled="disabled"
    :read-only="readonly"
    :name="name"
    :class="[stylex.props(styles.root).className, $attrs.class]"
    :style="[stylex.props(styles.root).style, $attrs.style]"
    @value-change="onValueChange"
  >
    <span v-if="label" :class="stylex.props(styles.label).className">{{ label }}</span>
    <NumberInputGroup :class="groupSx.className" :style="groupSx.style">
      <NumberInputDecrement
        v-if="showDecrement"
        :aria-label="decrementLabel"
        :class="decrementSx.className"
        :style="decrementSx.style"
      >
        <NvIcon name="minus" :size="18" />
      </NumberInputDecrement>
      <NumberInputControl
        :aria-label="label"
        :class="stylex.props(styles.control).className"
      />
      <NumberInputIncrement
        v-if="showIncrement"
        :aria-label="incrementLabel"
        :class="incrementSx.className"
        :style="incrementSx.style"
      >
        <NvIcon name="plus" :size="18" />
      </NumberInputIncrement>
    </NumberInputGroup>
  </NumberInput>
</template>
