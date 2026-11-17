<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Picker.styles'
import type { MobilePickerOption, MobilePickerValue } from './types'

const props = withDefaults(
  defineProps<{
    options: MobilePickerOption[]
    modelValue?: MobilePickerValue
    ariaLabel?: string
    itemHeight?: number
    disabled?: boolean
  }>(),
  {
    modelValue: undefined,
    ariaLabel: '选择项',
    itemHeight: 44,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: MobilePickerValue]
  change: [value: MobilePickerValue]
}>()

const wheelId = useId()
const viewport = ref<HTMLElement | null>(null)
const inner = ref<number | null>(null)
let scrollTimer: ReturnType<typeof setTimeout> | undefined
let programmaticUntil = 0

function findEnabled(start: number, direction: 1 | -1): number {
  let index = start
  while (index >= 0 && index < props.options.length) {
    if (!props.options[index]?.disabled) return index
    index += direction
  }
  return -1
}

const selectedIndex = computed(() => {
  if (props.modelValue !== undefined) {
    const found = props.options.findIndex((option) => option.value === props.modelValue)
    if (found >= 0) return found
  }
  if (inner.value !== null) {
    const option = props.options[inner.value]
    if (option && !option.disabled) return inner.value
  }
  return Math.max(findEnabled(0, 1), 0)
})

const wheelStyle = computed(() => ({
  height: `${props.itemHeight * 5}px`,
  paddingBlock: `${props.itemHeight * 2}px`,
}))

const bandStyle = computed(() => ({ height: `${props.itemHeight}px` }))

const wheelSx = computed(() =>
  stylex.props(styles.wheel, focus.subtle, props.disabled && styles.optionDisabled),
)

function scrollToIndex(index: number, behavior: ScrollBehavior = 'auto') {
  const el = viewport.value
  if (!el) return
  programmaticUntil = performance.now() + 260
  if (typeof el.scrollTo === 'function') {
    el.scrollTo({ top: index * props.itemHeight, behavior })
  } else {
    el.scrollTop = index * props.itemHeight
  }
}

function commit(index: number) {
  if (props.disabled) return
  const option = props.options[index]
  if (!option || option.disabled) return
  inner.value = index
  emit('update:modelValue', option.value)
  emit('change', option.value)
}

function onScroll() {
  if (performance.now() < programmaticUntil) return
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(settle, 120)
}

function settle() {
  const el = viewport.value
  if (!el) return
  const index = Math.min(
    props.options.length - 1,
    Math.max(0, Math.round(el.scrollTop / props.itemHeight)),
  )
  if (props.disabled || index === selectedIndex.value || props.options[index]?.disabled) {
    scrollToIndex(selectedIndex.value, 'smooth')
    return
  }
  commit(index)
  scrollToIndex(index, 'smooth')
}

function step(direction: 1 | -1) {
  const next = findEnabled(selectedIndex.value + direction, direction)
  if (next >= 0) {
    commit(next)
    scrollToIndex(next, 'smooth')
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    step(-1)
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    step(1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    const first = findEnabled(0, 1)
    if (first >= 0) {
      commit(first)
      scrollToIndex(first, 'smooth')
    }
  } else if (event.key === 'End') {
    event.preventDefault()
    const last = findEnabled(props.options.length - 1, -1)
    if (last >= 0) {
      commit(last)
      scrollToIndex(last, 'smooth')
    }
  }
}

function optionId(index: number) {
  return `${wheelId}-option-${index}`
}

watch(selectedIndex, (index) => {
  if (performance.now() > programmaticUntil) scrollToIndex(index, 'smooth')
})

watch(
  () => props.options.length,
  () => scrollToIndex(selectedIndex.value, 'auto'),
)

onMounted(() => scrollToIndex(selectedIndex.value, 'auto'))
onBeforeUnmount(() => clearTimeout(scrollTimer))
</script>

<template>
  <div :class="stylex.props(styles.column).className">
    <div
      aria-hidden="true"
      :class="stylex.props(styles.highlight).className"
      :style="bandStyle"
    />
    <div
      ref="viewport"
      role="listbox"
      tabindex="0"
      :aria-label="ariaLabel"
      :aria-activedescendant="optionId(selectedIndex)"
      :class="wheelSx.className"
      :style="[wheelSx.style, wheelStyle]"
      @scroll="onScroll"
      @keydown="onKeydown"
    >
      <div
        v-for="(option, index) in options"
        :id="optionId(index)"
        :key="`${option.value}-${index}`"
        role="option"
        :aria-selected="index === selectedIndex"
        :aria-disabled="option.disabled || undefined"
        :class="
          stylex.props(
            styles.option,
            index === selectedIndex && styles.optionSelected,
            option.disabled && styles.optionDisabled,
          ).className
        "
        :style="{ height: `${itemHeight}px` }"
        @click="commit(index)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>
