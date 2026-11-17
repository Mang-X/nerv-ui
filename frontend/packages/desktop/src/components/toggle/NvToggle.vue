<script setup lang="ts">
import { Toggle } from '@ui-sdk/vue/toggle'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Toggle.styles'
import type { NvToggleProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvToggleProps>(), {
  pressed: undefined,
  defaultPressed: undefined,
  value: undefined,
  disabled: false,
  focusableWhenDisabled: undefined,
  size: 'md',
  variant: 'ghost',
})

const sx = computed(() =>
  stylex.props(
    styles.toggle,
    focus.ring,
    props.variant === 'outline' && styles.outline,
    props.size === 'sm' && styles.sm,
  ),
)
</script>

<template>
  <Toggle
    v-bind="omitClassStyle($attrs)"
    :pressed="pressed"
    :default-pressed="defaultPressed"
    :value="value"
    :disabled="disabled"
    :focusable-when-disabled="focusableWhenDisabled"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </Toggle>
</template>
