<script setup lang="ts">
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from '@ui-sdk/vue/segmented-control'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { darkTheme } from '../../theme/tokens.stylex'
import { focus } from '../../theme/shared.stylex'
import { styles } from './ScreenSegmented.styles'
import type { ScreenSegmentedOption, ScreenSegmentedOrientation, ScreenSegmentedSize } from './types'

// Never attach an own `onUpdate:*` listener here: ui-sdk reads any attached one
// as a controller, and `$attrs` already forwards the consumer's `v-model`.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    options: ScreenSegmentedOption[]
    /** Controlled value (`v-model:value`); leave undefined for internal state. */
    value?: string | null
    defaultValue?: string | null
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    name?: string
    loop?: boolean
    orientation?: ScreenSegmentedOrientation
    size?: ScreenSegmentedSize
    block?: boolean
    ariaLabel?: string
  }>(),
  {
    value: undefined,
    defaultValue: undefined,
    disabled: false,
    readOnly: false,
    required: false,
    loop: true,
    orientation: 'horizontal',
    size: 'md',
    block: false,
    ariaLabel: '选项',
  },
)

const sizeStyles = {
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
} as const

const rootSx = computed(() =>
  stylex.props(
    darkTheme,
    styles.root,
    props.block && styles.block,
    props.orientation === 'vertical' && styles.vertical,
  ),
)
const indicatorSx = computed(() => stylex.props(styles.indicator))
const itemSx = computed(() =>
  stylex.props(
    styles.item,
    focus.subtle,
    sizeStyles[props.size],
    props.orientation === 'vertical' && styles.verticalItem,
  ),
)
</script>

<template>
  <SegmentedControl
    v-bind="$attrs"
    :value="value"
    :default-value="defaultValue"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :name="name"
    :loop="loop"
    :orientation="orientation"
    :aria-label="ariaLabel"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
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
      <slot name="option" :option="option">
        <span :class="stylex.props(styles.label).className">{{ option.label }}</span>
      </slot>
    </SegmentedControlItem>
  </SegmentedControl>
</template>
