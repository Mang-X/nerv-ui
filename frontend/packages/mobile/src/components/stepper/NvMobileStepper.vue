<script setup lang="ts">
import {
  NumberInput,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from '@ui-sdk/vue/number-input'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { styles } from './Stepper.styles'
import type { NvMobileStepperProps } from './types'

/**
 * 移动端步进器。根是 `NumberInput`，增减与数字框是它内部的部件——
 * 夹值、步长、键盘与输入框编辑都由原语承担，这里不自己算。
 */
withDefaults(defineProps<NvMobileStepperProps>(), { min: 0, step: 1, disabled: false })

defineOptions({ inheritAttrs: false })

const sx = computed(() => ({
  root: stylex.props(styles.root),
  button: stylex.props(styles.button),
  field: stylex.props(styles.field),
}))
</script>

<template>
  <NumberInput
    v-bind="$attrs"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :class="[sx.root.className, $attrs.class]"
    :style="[sx.root.style, $attrs.style]"
  >
    <NumberInputGroup>
      <NumberInputDecrement :class="sx.button.className" :style="sx.button.style" aria-label="减少">
        <NvIcon name="minus" :size="16" />
      </NumberInputDecrement>
      <NumberInput :aria-label="label" :class="sx.field.className" :style="sx.field.style" />
      <NumberInputIncrement :class="sx.button.className" :style="sx.button.style" aria-label="增加">
        <NvIcon name="plus" :size="16" />
      </NumberInputIncrement>
    </NumberInputGroup>
  </NumberInput>
</template>
