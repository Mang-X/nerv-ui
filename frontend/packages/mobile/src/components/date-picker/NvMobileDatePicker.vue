<script setup lang="ts">
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@ui-sdk/vue/dialog'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, watch } from 'vue'
import { focus, glass, overlay } from '../../theme/shared.stylex'
import PickerWheel from '../picker/PickerWheel.vue'
import { styles } from '../picker/Picker.styles'
import { dateStyles } from './DatePicker.styles'
import type { MobileDatePickerProps } from './types'

interface DateParts {
  year: number
  month: number
  day: number
}

const props = withDefaults(defineProps<MobileDatePickerProps>(), {
  // Undefined, not false: keeps the ui-sdk dialog uncontrolled until the caller
  // opts in with v-model:open.
  open: undefined,
  defaultOpen: false,
  title: '选择日期',
  modelValue: undefined,
  defaultValue: null,
  min: undefined,
  max: undefined,
  yearRange: undefined,
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  ariaLabel: '日期选择器',
  modal: true,
  dismissible: true,
  closeOnOutsidePress: true,
  triggerLabel: undefined,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  'open-change': [open: boolean]
  'update:modelValue': [value: string | null]
  change: [value: string | null]
  confirm: [value: string | null]
  cancel: []
}>()

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function parseIso(value: string | null | undefined): DateParts | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null
  return { year, month, day }
}

function toIso(parts: DateParts) {
  return `${String(parts.year).padStart(4, '0')}-${pad(parts.month)}-${pad(parts.day)}`
}

function today(): DateParts {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
}

const minParts = computed(() => parseIso(props.min))
const maxParts = computed(() => parseIso(props.max))

function clampDate(parts: DateParts): DateParts {
  const iso = toIso(parts)
  if (props.min && iso < props.min) {
    const min = minParts.value
    if (min) return { ...min }
  }
  if (props.max && iso > props.max) {
    const max = maxParts.value
    if (max) return { ...max }
  }
  return parts
}

const yearBounds = computed<[number, number]>(() => {
  if (props.yearRange) {
    return [
      Math.min(props.yearRange[0], props.yearRange[1]),
      Math.max(props.yearRange[0], props.yearRange[1]),
    ]
  }
  const current = new Date().getFullYear()
  const start = minParts.value?.year ?? current - 50
  const end = maxParts.value?.year ?? current + 20
  return [Math.min(start, end), Math.max(start, end)]
})

const yearOptions = computed(() => {
  const [start, end] = yearBounds.value
  const list = []
  for (let year = start; year <= end; year += 1) {
    list.push({ label: `${year}年`, value: year })
  }
  return list
})

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  label: `${index + 1}月`,
  value: index + 1,
}))

const draft = ref<DateParts>(today())
const committed = ref<string | null>(null)

function initialDate(): DateParts {
  const candidates = [
    parseIso(props.modelValue),
    parseIso(props.defaultValue),
    parseIso(committed.value),
  ]
  return clampDate(candidates.find((part) => part !== null) ?? today())
}

function syncDraft() {
  draft.value = initialDate()
}

syncDraft()

const dayOptions = computed(() =>
  Array.from({ length: daysInMonth(draft.value.year, draft.value.month) }, (_, index) => ({
    label: `${index + 1}日`,
    value: index + 1,
  })),
)

watch(
  () => props.modelValue,
  () => syncDraft(),
)

watch(
  () => [draft.value.year, draft.value.month] as const,
  () => {
    const next = clampDate({
      year: draft.value.year,
      month: draft.value.month,
      day: Math.min(draft.value.day, daysInMonth(draft.value.year, draft.value.month)),
    })
    if (
      next.year !== draft.value.year ||
      next.month !== draft.value.month ||
      next.day !== draft.value.day
    ) {
      draft.value = next
    }
  },
)

function onOpenChange(open: boolean) {
  if (open) syncDraft()
  emit('update:open', open)
  emit('open-change', open)
}

function onYear(value: string | number) {
  draft.value = { ...draft.value, year: Number(value) }
}

function onMonth(value: string | number) {
  draft.value = { ...draft.value, month: Number(value) }
}

function onDay(value: string | number) {
  draft.value = {
    ...draft.value,
    day: Math.min(Number(value), daysInMonth(draft.value.year, draft.value.month)),
  }
}

function confirm() {
  const value = toIso(clampDate(draft.value))
  committed.value = value
  emit('update:modelValue', value)
  emit('change', value)
  emit('confirm', value)
}

function cancel() {
  emit('cancel')
}

const contentSx = computed(() => stylex.props(styles.content, glass.surface))
const columnsSx = computed(() => stylex.props(dateStyles.columns))
const cancelSx = computed(() => stylex.props(styles.action, focus.ring))
const confirmSx = computed(() =>
  stylex.props(styles.action, styles.actionPrimary, focus.ring),
)
</script>

<template>
  <Dialog
    :open="open"
    :default-open="defaultOpen"
    :modal="modal"
    :dismissible="dismissible"
    :close-on-outside-press="closeOnOutsidePress"
    presentation="sheet"
    @open-change="onOpenChange"
  >
    <DialogTrigger v-if="triggerLabel || $slots.trigger" :class="stylex.props(styles.trigger, focus.ring).className">
      <slot name="trigger">{{ triggerLabel }}</slot>
    </DialogTrigger>
    <DialogBackdrop :class="stylex.props(overlay.backdrop).className" />
    <DialogContent
      v-bind="$attrs"
      :aria-label="title || $slots.title ? undefined : ariaLabel"
      :class="[contentSx.className, $attrs.class]"
      :style="[contentSx.style, $attrs.style]"
    >
      <span aria-hidden="true" :class="stylex.props(styles.handle).className" />
      <div :class="stylex.props(styles.header).className">
        <DialogTitle :class="stylex.props(styles.title).className">
          <slot name="title">{{ title }}</slot>
        </DialogTitle>
        <DialogDescription
          v-if="$slots.description"
          :class="stylex.props(styles.description).className"
        >
          <slot name="description" />
        </DialogDescription>
      </div>
      <div :class="columnsSx.className" :style="columnsSx.style">
        <div :class="[stylex.props(dateStyles.yearColumn).className]">
          <div :class="stylex.props(dateStyles.caption).className">年</div>
          <PickerWheel
            :options="yearOptions"
            :model-value="draft.year"
            aria-label="年份"
            @update:model-value="onYear"
          />
        </div>
        <div :class="[stylex.props(dateStyles.monthColumn).className]">
          <div :class="stylex.props(dateStyles.caption).className">月</div>
          <PickerWheel
            :options="monthOptions"
            :model-value="draft.month"
            aria-label="月份"
            @update:model-value="onMonth"
          />
        </div>
        <div :class="[stylex.props(dateStyles.dayColumn).className]">
          <div :class="stylex.props(dateStyles.caption).className">日</div>
          <PickerWheel
            :options="dayOptions"
            :model-value="draft.day"
            aria-label="日"
            @update:model-value="onDay"
          />
        </div>
      </div>
      <div :class="stylex.props(styles.footer).className">
        <DialogClose
          v-if="showCancel"
          :class="cancelSx.className"
          :style="cancelSx.style"
          @click="cancel"
        >
          <slot name="cancel">{{ cancelText }}</slot>
        </DialogClose>
        <DialogClose :class="confirmSx.className" :style="confirmSx.style" @click="confirm">
          <slot name="confirm">{{ confirmText }}</slot>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
</template>
