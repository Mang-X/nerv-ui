<script setup lang="ts">
import { Input, InputClear, InputGroup } from '@ui-sdk/vue/input'
import * as stylex from '@stylexjs/stylex'
import { computed, useAttrs } from 'vue'
import { darkTheme } from '../../theme/tokens.stylex'
import { focus } from '../../theme/shared.stylex'
import { styles } from './ScreenInput.styles'
import type { ScreenInputSize } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    placeholder?: string
    size?: ScreenInputSize
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    name?: string
    type?: string
    clearable?: boolean
  }>(),
  { size: 'md', disabled: false, readOnly: false, required: false, type: 'text', clearable: false },
)

const model = defineModel<string>({ default: '' })
const attrs = useAttrs()

const rootSx = computed(() =>
  stylex.props(
    darkTheme,
    styles.root,
    focus.ring,
    props.size === 'lg' ? styles.lg : styles.md,
  ),
)
const inputSx = computed(() => stylex.props(styles.input))
const clearSx = computed(() => stylex.props(styles.clear))

const rootAttrs = computed(() => ({
  class: [rootSx.value.className, attrs.class],
  style: [rootSx.value.style, attrs.style],
}))

const inputAttrs = computed(() => omit(attrs, ['class', 'style']))
</script>

<template>
  <InputGroup v-bind="rootAttrs">
    <span v-if="$slots.prefix" :class="stylex.props(styles.affix).className">
      <slot name="prefix" />
    </span>
    <Input
      v-model:value="model"
      v-bind="inputAttrs"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :read-only="readOnly"
      :required="required"
      :name="name"
      :class="inputSx.className"
      :style="inputSx.style"
    />
    <InputClear v-if="clearable" aria-label="清除" :class="clearSx.className" :style="clearSx.style">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M6 6l12 12M18 6L6 18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </InputClear>
    <span v-if="$slots.suffix" :class="stylex.props(styles.affix).className">
      <slot name="suffix" />
    </span>
  </InputGroup>
</template>

<script lang="ts">
function omit<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) if (!keys.includes(k)) out[k] = v
  return out as Partial<T>
}
</script>
