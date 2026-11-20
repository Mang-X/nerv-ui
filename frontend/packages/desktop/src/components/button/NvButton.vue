<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Button.styles'
import type { ButtonSize, ButtonVariant } from './types'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    block?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'secondary', size: 'md', block: false, disabled: false, type: 'button' },
)

const sx = computed(() =>
  stylex.props(
    styles.base,
    focus.ring,
    styles[props.variant],
    styles[props.size],
    props.block && styles.block,
  ),
)
</script>

<template>
  <Button
    :type="type"
    :disabled="disabled"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
    v-bind="omit($attrs, ['class', 'style'])"
  >
    <slot />
  </Button>
</template>

<script lang="ts">
function omit<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) if (!keys.includes(k)) out[k] = v
  return out as Partial<T>
}
</script>
