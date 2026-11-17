<script setup lang="ts">
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from '@ui-sdk/vue/segmented-control'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Segmented.styles'
import type { SegmentedOption, SegmentedSize } from './types'

const props = withDefaults(
  defineProps<{
    options: SegmentedOption[]
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    name?: string
    loop?: boolean
    ariaLabel?: string
    size?: SegmentedSize
    orientation?: 'horizontal' | 'vertical'
    block?: boolean
  }>(),
  {
    disabled: false,
    readOnly: false,
    required: false,
    ariaLabel: '选项',
    size: 'md',
    orientation: 'horizontal',
    block: false,
    loop: true,
  },
)

const model = defineModel<string | null>({ default: null })

const sizeStyles = {
  md: styles.mdItem,
  lg: styles.lgItem,
  xl: styles.xlItem,
} as const

const rootSx = computed(() =>
  stylex.props(
    styles.root,
    props.block && styles.block,
    props.orientation === 'vertical' && styles.vertical,
  ),
)
const indicatorSx = computed(() => stylex.props(styles.indicator))
const itemSx = computed(() =>
  stylex.props(styles.item, focus.subtle, sizeStyles[props.size]),
)
</script>

<template>
  <SegmentedControl
    v-model:value="model"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :name="name"
    :loop="loop"
    :orientation="orientation"
    :aria-label="ariaLabel"
    :class="rootSx.className"
    :style="rootSx.style"
  >
    <SegmentedControlIndicator :class="indicatorSx.className" :style="indicatorSx.style" />
    <SegmentedControlItem
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :disabled="option.disabled"
      :class="itemSx.className"
      :style="itemSx.style"
    >
      <slot name="option" :option="option">{{ option.label }}</slot>
    </SegmentedControlItem>
  </SegmentedControl>
</template>
