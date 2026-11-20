<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
  type ListData,
} from '@ui-sdk/vue/select'
import * as stylex from '@stylexjs/stylex'
import { computed, useAttrs } from 'vue'
import { darkTheme } from '../../theme/tokens.stylex'
import { focus } from '../../theme/shared.stylex'
import { styles } from './ScreenSelect.styles'
import type {
  ScreenSelectOption,
  ScreenSelectPresentation,
  ScreenSelectSize,
} from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    options: ScreenSelectOption[]
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    name?: string
    size?: ScreenSelectSize
    block?: boolean
    presentation?: ScreenSelectPresentation
    ariaLabel?: string
  }>(),
  {
    placeholder: '请选择',
    disabled: false,
    readOnly: false,
    required: false,
    size: 'md',
    block: false,
    presentation: 'popover',
    ariaLabel: '选择',
  },
)

const model = defineModel<string | null>({ default: null })
const attrs = useAttrs()

const listItems = computed<ListData>(() => props.options as unknown as ListData)

const rootSx = computed(() => stylex.props(styles.root, props.block && styles.block))
const triggerSx = computed(() =>
  stylex.props(
    darkTheme,
    styles.trigger,
    focus.ring,
    props.size === 'lg' ? styles.lgTrigger : styles.mdTrigger,
  ),
)
const contentSx = computed(() => stylex.props(styles.content))

const rootAttrs = computed(() => ({
  class: [rootSx.value.className, attrs.class],
  style: [rootSx.value.style, attrs.style],
}))
const triggerAttrs = computed(() => omit(attrs, ['class', 'style']))

const itemSx = computed(() =>
  stylex.props(styles.item, props.size === 'lg' ? styles.lgItem : styles.mdItem),
)
</script>

<template>
  <div v-bind="rootAttrs">
    <Select
      v-model:value="model"
      :items="listItems"
      :placeholder="placeholder"
      :disabled="disabled"
      :read-only="readOnly"
      :required="required"
      :name="name"
      :presentation="presentation"
    >
      <SelectTrigger
        v-bind="triggerAttrs"
        :aria-label="ariaLabel"
        :class="triggerSx.className"
        :style="triggerSx.style"
      >
        <SelectValue :class="stylex.props(styles.value).className" />
        <span :class="stylex.props(styles.chevron).className" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" focusable="false">
            <path
              d="M6 9l6 6 6-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </SelectTrigger>
      <SelectContent :class="contentSx.className" :style="contentSx.style" :side-offset="6">
        <SelectItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :label="option.label"
          :disabled="option.disabled"
          :class="itemSx.className"
          :style="itemSx.style"
        >
          <span>{{ option.label }}</span>
          <SelectItemIndicator :class="stylex.props(styles.check).className">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M5 12.5l4.5 4.5L19 7"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </SelectItemIndicator>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>

<script lang="ts">
function omit<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) if (!keys.includes(k)) out[k] = v
  return out as Partial<T>
}
</script>
