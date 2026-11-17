<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectEmpty,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@ui-sdk/vue/select'
import { CheckIcon, ChevronDownIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { focus, glass, overlay, presence } from '../../theme/shared.stylex'
import { styles } from './TouchSelect.styles'
import type { TouchSelectProps, TouchSelectValue } from './types'

const props = withDefaults(defineProps<TouchSelectProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  multiple: undefined,
  disabled: false,
  readOnly: false,
  required: false,
  name: undefined,
  label: undefined,
  placeholder: '请选择',
  maxLabels: undefined,
  emptyLabel: '暂无可选项',
  size: 'lg',
  side: 'bottom',
  align: 'start',
})

const emit = defineEmits<{ 'update:modelValue': [value: TouchSelectValue] }>()

function normalize(value: TouchSelectValue): TouchSelectValue {
  if (props.multiple === true) {
    if (Array.isArray(value)) return value
    return value === null ? [] : [value]
  }
  return Array.isArray(value) ? (value[0] ?? null) : value
}

// Local state carries the uncontrolled case; the prop wins once a caller
// attaches `v-model`. The primitive stays controlled by this wrapper either way.
const inner = ref<TouchSelectValue>(normalize(props.defaultValue ?? (props.multiple ? [] : null)))
const current = computed(() =>
  props.modelValue !== undefined ? normalize(props.modelValue) : inner.value,
)

function handleValueChange(next: unknown) {
  const value = normalize(next as TouchSelectValue)
  inner.value = value
  emit('update:modelValue', value)
}

const rootSx = computed(() => stylex.props(styles.root))
const labelSx = computed(() => stylex.props(styles.label))
const triggerSx = computed(() =>
  stylex.props(
    styles.trigger,
    focus.ring,
    props.size === 'md' ? styles.mdTrigger : styles.lgTrigger,
  ),
)
const valueSx = computed(() => stylex.props(styles.value))
const chevronSx = computed(() => stylex.props(styles.chevron))
const contentSx = computed(() =>
  stylex.props(glass.surface, overlay.panel, presence.fadeZoom, styles.content),
)
const emptySx = computed(() => stylex.props(styles.empty))
const itemSx = computed(() => stylex.props(styles.item, focus.subtle))
const itemTextSx = computed(() => stylex.props(styles.itemText))
const indicatorSx = computed(() => stylex.props(styles.indicator))
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style">
    <Select
      :value="current"
      :multiple="multiple"
      :disabled="disabled"
      :read-only="readOnly"
      :required="required"
      :name="name"
      :items="options"
      :placeholder="placeholder"
      @value-change="handleValueChange"
    >
      <SelectLabel v-if="label" :class="labelSx.className" :style="labelSx.style">
        {{ label }}
      </SelectLabel>
      <SelectTrigger :class="triggerSx.className" :style="triggerSx.style">
        <SelectValue
          :placeholder="placeholder"
          :class="valueSx.className"
          :style="valueSx.style"
          :max-labels="maxLabels"
        />
        <ChevronDownIcon
          :size="24"
          aria-hidden="true"
          :class="chevronSx.className"
          :style="chevronSx.style"
        />
      </SelectTrigger>
      <SelectContent
        :side="side"
        :align="align"
        :side-offset="8"
        :class="[contentSx.className]"
        :style="[contentSx.style]"
      >
        <SelectItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
          :class="itemSx.className"
          :style="itemSx.style"
        >
          <SelectItemText :class="itemTextSx.className" :style="itemTextSx.style">
            {{ option.label }}
          </SelectItemText>
          <SelectItemIndicator :class="indicatorSx.className" :style="indicatorSx.style">
            <CheckIcon :size="22" aria-hidden="true" />
          </SelectItemIndicator>
        </SelectItem>
        <SelectEmpty v-if="!options.length" :class="emptySx.className" :style="emptySx.style">
          {{ emptyLabel }}
        </SelectEmpty>
      </SelectContent>
    </Select>
  </div>
</template>
