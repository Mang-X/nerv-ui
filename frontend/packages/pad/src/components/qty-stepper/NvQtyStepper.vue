<script setup lang="ts">
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from '@ui-sdk/vue/number-input'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './QtyStepper.styles'
import type { QtyStepperSize } from './types'

const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
    step?: number
    largeStep?: number
    smallStep?: number
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    name?: string
    size?: QtyStepperSize
    decrementLabel?: string
    incrementLabel?: string
    controlLabel?: string
  }>(),
  {
    min: 0,
    step: 1,
    disabled: false,
    readOnly: false,
    required: false,
    size: 'md',
    decrementLabel: '减少',
    incrementLabel: '增加',
    controlLabel: '数量',
  },
)

const model = defineModel<number | null>({ default: 1 })

const rootSx = computed(() => stylex.props(styles.root))
const groupSx = computed(() => stylex.props(styles.group, focus.ring))
const buttonSx = computed(() =>
  stylex.props(styles.button, props.size === 'lg' ? styles.lgButton : styles.mdButton),
)
const controlSx = computed(() =>
  stylex.props(styles.control, props.size === 'lg' ? styles.lgControl : styles.mdControl),
)
</script>

<template>
  <NumberInput
    v-model:value="model"
    :min="min"
    :max="max"
    :step="step"
    :large-step="largeStep"
    :small-step="smallStep"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :name="name"
    :class="rootSx.className"
    :style="rootSx.style"
  >
    <NumberInputGroup :class="groupSx.className" :style="groupSx.style">
      <NumberInputDecrement
        :aria-label="decrementLabel"
        :class="buttonSx.className"
        :style="buttonSx.style"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </NumberInputDecrement>
      <NumberInputControl
        :aria-label="controlLabel"
        :class="controlSx.className"
        :style="controlSx.style"
      />
      <NumberInputIncrement
        :aria-label="incrementLabel"
        :class="buttonSx.className"
        :style="buttonSx.style"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M5 12h14M12 5v14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </NumberInputIncrement>
    </NumberInputGroup>
  </NumberInput>
</template>
