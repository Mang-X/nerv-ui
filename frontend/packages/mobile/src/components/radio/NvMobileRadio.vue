<script setup lang="ts">
import { Radio, RadioIndicator } from '@ui-sdk/vue/radio'
import * as stylex from '@stylexjs/stylex'
import { focus } from '../../theme/shared.stylex'
import { styles } from './MobileRadio.styles'

const props = withDefaults(
  defineProps<{
    value: string
    disabled?: boolean
    label?: string
  }>(),
  {
    disabled: false,
    label: undefined,
  },
)
</script>

<template>
  <label :class="stylex.props(styles.row, props.disabled && styles.rowDisabled).className">
    <Radio v-slot="{ state }" :value="value" :disabled="disabled" :class="stylex.props(styles.radio, focus.ring).className">
      <RadioIndicator
        :class="stylex.props(styles.indicator, state.checked && styles.indicatorChecked).className"
      >
        <span v-if="state.checked" :class="stylex.props(styles.dot).className" />
      </RadioIndicator>
    </Radio>
    <span v-if="label || $slots.default" :class="stylex.props(styles.label).className">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
