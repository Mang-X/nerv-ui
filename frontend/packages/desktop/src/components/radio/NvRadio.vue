<script setup lang="ts">
import { Radio, RadioIndicator } from '@ui-sdk/vue/radio'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Radio.styles'
import type { NvRadioProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvRadioProps>(), { disabled: false })

const rootSx = computed(() => stylex.props(styles.root))
const radioSx = computed(() => stylex.props(styles.radio, focus.ring))
const indicatorSx = computed(() => stylex.props(styles.indicator))
const labelSx = computed(() => stylex.props(styles.label))
</script>

<template>
  <label :class="[rootSx.className, $attrs.class]" :style="[rootSx.style, $attrs.style]">
    <Radio
      v-bind="omitClassStyle($attrs)"
      :value="value"
      :disabled="disabled"
      :class="radioSx.className"
      :style="radioSx.style"
    >
      <RadioIndicator :class="indicatorSx.className" :style="indicatorSx.style" />
    </Radio>
    <span v-if="$slots.default || label" :class="labelSx.className" :style="labelSx.style">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
