<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './TouchList.styles'
import type { TouchListItem, TouchListProps } from './types'

const props = withDefaults(defineProps<TouchListProps>(), {
  modelValue: undefined,
  defaultValue: null,
  label: undefined,
  emptyLabel: '暂无内容',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  select: [item: TouchListItem]
}>()

// Local state carries the uncontrolled case; the prop wins once a caller
// attaches `v-model`.
const inner = ref<string | null>(props.defaultValue)
const current = computed(() => props.modelValue ?? inner.value)

function isSelected(item: TouchListItem) {
  return current.value === item.value
}

function pick(item: TouchListItem) {
  if (props.disabled || item.disabled) return
  const next = isSelected(item) ? null : item.value
  inner.value = next
  emit('update:modelValue', next)
  emit('select', item)
}

const rootSx = computed(() => stylex.props(styles.root, props.disabled && styles.rootDisabled))
const headerSx = computed(() => stylex.props(styles.header))
const rowSx = computed(() => stylex.props(styles.row, focus.subtle))
const selectedRowSx = computed(() => stylex.props(styles.row, styles.rowSelected, focus.subtle))
const leadingSx = computed(() => stylex.props(styles.leading))
const bodySx = computed(() => stylex.props(styles.body))
const titleSx = computed(() => stylex.props(styles.title))
const descriptionSx = computed(() => stylex.props(styles.description))
const trailingSx = computed(() => stylex.props(styles.trailing))
const emptySx = computed(() => stylex.props(styles.empty))
</script>

<template>
  <div
    :class="rootSx.className"
    :style="rootSx.style"
    role="list"
    :aria-disabled="disabled || undefined"
  >
    <div v-if="label || $slots.header" :class="headerSx.className" :style="headerSx.style">
      <slot name="header">{{ label }}</slot>
    </div>
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      :disabled="disabled || item.disabled"
      :aria-pressed="isSelected(item) || undefined"
      :class="[isSelected(item) ? selectedRowSx.className : rowSx.className]"
      :style="isSelected(item) ? selectedRowSx.style : rowSx.style"
      @click="pick(item)"
    >
      <span v-if="$slots.leading" :class="leadingSx.className" :style="leadingSx.style">
        <slot name="leading" :item="item" />
      </span>
      <slot name="item" :item="item" :selected="isSelected(item)">
        <span :class="bodySx.className" :style="bodySx.style">
          <span :class="titleSx.className" :style="titleSx.style">{{ item.title }}</span>
          <span
            v-if="item.description"
            :class="descriptionSx.className"
            :style="descriptionSx.style"
          >
            {{ item.description }}
          </span>
        </span>
      </slot>
      <span :class="trailingSx.className" :style="trailingSx.style">
        <slot name="trailing" :item="item">
          <span v-if="item.meta">{{ item.meta }}</span>
        </slot>
        <NvIcon name="check" v-if="isSelected(item)" :size="22" />
      </span>
    </button>
    <div v-if="!items.length" :class="emptySx.className" :style="emptySx.style">
      <slot name="empty">{{ emptyLabel }}</slot>
    </div>
  </div>
</template>
