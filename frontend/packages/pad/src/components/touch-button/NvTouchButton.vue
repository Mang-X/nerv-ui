<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './TouchButton.styles'
import type { TouchButtonSize, TouchButtonVariant } from './types'

const props = withDefaults(
  defineProps<{
    variant?: TouchButtonVariant
    size?: TouchButtonSize
    block?: boolean
    disabled?: boolean
    iconOnly?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    block: false,
    disabled: false,
    iconOnly: false,
    type: 'button',
  },
)

const iconOnlyStyle = computed(
  () => ({ md: styles.iconMd, lg: styles.iconLg, xl: styles.iconXl })[props.size],
)

const sx = computed(() =>
  stylex.props(
    styles.base,
    focus.ring,
    styles[props.variant],
    styles[props.size],
    props.iconOnly && iconOnlyStyle.value,
    props.block && styles.block,
  ),
)
</script>

<template>
  <Button
    :type="type"
    :disabled="disabled"
    :class="sx.className"
    :style="sx.style"
  >
    <span v-if="$slots.icon" :class="stylex.props(styles.icon).className">
      <slot name="icon" />
    </span>
    <slot />
  </Button>
</template>
