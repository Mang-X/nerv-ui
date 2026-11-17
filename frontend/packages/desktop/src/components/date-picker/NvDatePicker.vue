<script setup lang="ts">
import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerClear,
  DatePickerContent,
  DatePickerInput,
  DatePickerTrigger,
} from '@ui-sdk/vue/date-picker'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from '@lucide/vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus, glass, presence } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './DatePicker.styles'
import type { NvDatePickerProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvDatePickerProps>(), {
  placeholder: '选择日期',
  ariaLabel: '日期',
  clearable: false,
  clearLabel: '清除日期',
  triggerLabel: '打开日历',
  prevLabel: '上个月',
  nextLabel: '下个月',
  months: 1,
  side: 'bottom',
  align: 'start',
})

// Every `onUpdate:*` listener arrives through $attrs and is forwarded untouched:
// ui-sdk primitives treat an attached update listener as a controller, so the
// wrapper must never attach one the caller didn't ask for.
const fieldSx = computed(() => stylex.props(styles.field, focus.ring))
const inputSx = computed(() => stylex.props(styles.input))
const separatorSx = computed(() => stylex.props(styles.separator))
const triggerSx = computed(() => stylex.props(styles.trigger, focus.ring))
const clearSx = computed(() => stylex.props(styles.clear, focus.subtle))
const contentSx = computed(() => stylex.props(glass.surface, styles.content, presence.fadeZoom))
const headerSx = computed(() => stylex.props(styles.header))
const headingSx = computed(() => stylex.props(styles.heading))
const navSx = computed(() => stylex.props(styles.nav, focus.subtle))
const gridsSx = computed(() => stylex.props(styles.grids))
const gridSx = computed(() => stylex.props(styles.grid))
const weekdaySx = computed(() => stylex.props(styles.weekday))
const daySx = computed(() => stylex.props(styles.day, focus.subtle))

const gridOffsets = computed(() => Array.from({ length: props.months }, (_, index) => index))
</script>

<template>
  <DatePicker
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :default-value="defaultValue"
    :open="open"
    :default-open="defaultOpen"
    :month="month"
    :default-month="defaultMonth"
    :min="min"
    :max="max"
    :unavailable="unavailable"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :locale="locale"
    :week-starts-on="weekStartsOn"
    :weekday-format="weekdayFormat"
    :month-format="monthFormat"
    :fixed-weeks="fixedWeeks"
    :show-outside-days="showOutsideDays"
    :months="months"
    :page-by="pageBy"
    :close-on-select="closeOnSelect"
    :today="today"
    :time-zone="timeZone"
    :name="name"
    :form="form"
    :class="[fieldSx.className, $attrs.class]"
    :style="[fieldSx.style, $attrs.style]"
  >
    <DatePickerInput
      :aria-label="ariaLabel"
      :placeholder="placeholder"
      :class="inputSx.className"
      :style="inputSx.style"
    />
    <DatePickerClear
      v-if="clearable"
      :aria-label="clearLabel"
      :class="clearSx.className"
      :style="clearSx.style"
    >
      <XIcon :size="14" aria-hidden="true" />
    </DatePickerClear>
    <DatePickerTrigger
      :aria-label="triggerLabel"
      :class="triggerSx.className"
      :style="triggerSx.style"
    >
      <CalendarIcon :size="16" aria-hidden="true" />
    </DatePickerTrigger>
    <DatePickerContent
      :side="side"
      :align="align"
      :side-offset="sideOffset ?? 6"
      :class="contentSx.className"
      :style="contentSx.style"
    >
      <div :class="headerSx.className" :style="headerSx.style">
        <CalendarPrevious
          :aria-label="prevLabel"
          :class="navSx.className"
          :style="navSx.style"
        >
          <ChevronLeftIcon :size="16" aria-hidden="true" />
        </CalendarPrevious>
        <CalendarHeading :class="headingSx.className" :style="headingSx.style" />
        <CalendarNext :aria-label="nextLabel" :class="navSx.className" :style="navSx.style">
          <ChevronRightIcon :size="16" aria-hidden="true" />
        </CalendarNext>
      </div>
      <div :class="gridsSx.className" :style="gridsSx.style">
        <CalendarGrid
          v-for="offset in gridOffsets"
          :key="offset"
          :offset="offset"
          :class="gridSx.className"
          :style="gridSx.style"
        >
          <CalendarWeekdays v-slot="{ index }">
            <CalendarWeekday
              :index="index"
              :class="weekdaySx.className"
              :style="weekdaySx.style"
            />
          </CalendarWeekdays>
          <CalendarWeeks v-slot="{ cell }">
            <CalendarDay
              :value="cell.date"
              :class="daySx.className"
              :style="daySx.style"
            />
          </CalendarWeeks>
        </CalendarGrid>
      </div>
    </DatePickerContent>
  </DatePicker>
</template>
