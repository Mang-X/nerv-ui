<script setup lang="ts">
import { ToggleGroup } from '@ui-sdk/vue/toggle'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Toggle.styles'
import type { NvToggleGroupProps } from './types'

// `v-model:value` arrives through $attrs and is forwarded untouched; the
// wrapper never attaches its own `onUpdate:value` listener.
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvToggleGroupProps>(), {
  value: undefined,
  defaultValue: undefined,
  multiple: false,
  deselectable: undefined,
  disabled: false,
  orientation: undefined,
  loop: undefined,
})

const sx = computed(() => stylex.props(styles.group))
</script>

<template>
  <ToggleGroup
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :default-value="defaultValue"
    :multiple="multiple"
    :deselectable="deselectable"
    :disabled="disabled"
    :orientation="orientation"
    :loop="loop"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <slot />
  </ToggleGroup>
</template>
