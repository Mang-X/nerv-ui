<script setup lang="ts">
import {
  CalendarDay,
  CalendarGrid,
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
import { computed, ref, watch } from 'vue'
import { focus, glass, presence } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './DatePicker.styles'
import type { NvDateRangePickerProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvDateRangePickerProps>(), {
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期',
  startAriaLabel: '开始日期',
  endAriaLabel: '结束日期',
  clearable: false,
  clearLabel: '清除日期范围',
  triggerLabel: '打开日历',
  prevLabel: '上个月',
  nextLabel: '下个月',
  yearLabel: '年份',
  monthLabel: '月份',
  open: undefined,
  disabled: undefined,
  readOnly: undefined,
  required: undefined,
  fixedWeeks: undefined,
  showOutsideDays: undefined,
  closeOnSelect: undefined,
  months: 2,
  side: 'bottom',
  align: 'start',
})

const fieldSx = computed(() => stylex.props(styles.field, focus.ring))
const inputSx = computed(() => stylex.props(styles.input))
const separatorSx = computed(() => stylex.props(styles.separator))
const triggerSx = computed(() => stylex.props(styles.trigger, focus.ring))
const clearSx = computed(() => stylex.props(styles.clear, focus.subtle))
const contentSx = computed(() => stylex.props(glass.surface, styles.content, presence.fadeZoom))
const headerSx = computed(() => stylex.props(styles.header))
const navSx = computed(() => stylex.props(styles.nav, focus.subtle))
const nextSx = computed(() => stylex.props(styles.navNext))
const gridsSx = computed(() => stylex.props(styles.grids))
const gridSx = computed(() => stylex.props(styles.grid))
/** `YYYY-MM-DD` → 日序号：Intl 的 numeric 日格式在中文里会带「日」。 */
function dayNumber(iso: string) {
  return Number(iso.slice(8, 10))
}
const weekdaySx = computed(() => stylex.props(styles.weekday))
const daySx = computed(() => stylex.props(styles.day, focus.subtle))

const gridOffsets = computed(() => Array.from({ length: props.months }, (_, index) => index))

/** 三视图（日 / 月 / 年），与单日期选择共用同一套交互。 */
type CalendarView = 'day' | 'month' | 'year'
const view = ref<CalendarView>('day')

function initialMonth(): string {
  const source = props.month ?? props.defaultMonth
  if (source) return source
  const value = props.value ?? props.defaultValue
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0].slice(0, 7)
  const today = props.today ?? new Date().toISOString().slice(0, 10)
  return today.slice(0, 7)
}

const viewMonth = ref(initialMonth())
watch(
  () => props.month,
  (next) => {
    if (next) viewMonth.value = next
  },
)
watch(
  () => props.open,
  (next) => {
    if (next) view.value = 'day'
  },
)

const activeYear = computed(() => Number(viewMonth.value.slice(0, 4)))
const activeMonth = computed(() => Number(viewMonth.value.slice(5, 7)))
const monthNames = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: new Intl.DateTimeFormat(props.locale ?? 'zh-CN', { month: 'long' }).format(
      new Date(2020, i, 1),
    ),
  })),
)
const decadeStart = computed(() => Math.floor(activeYear.value / 12) * 12)
const yearCells = computed(() =>
  Array.from({ length: 12 }, (_, i) => decadeStart.value + i),
)

function shift(dir: -1 | 1) {
  if (view.value === 'day') {
    const next = new Date(activeYear.value, activeMonth.value - 1 + dir, 1)
    viewMonth.value = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
    return
  }
  if (view.value === 'month') {
    viewMonth.value = `${activeYear.value + dir}-${String(activeMonth.value).padStart(2, '0')}`
    return
  }
  viewMonth.value = `${activeYear.value + dir * 12}-${String(activeMonth.value).padStart(2, '0')}`
}

function chooseMonth(month: number) {
  viewMonth.value = `${activeYear.value}-${String(month).padStart(2, '0')}`
  view.value = 'day'
}

function chooseYear(year: number) {
  viewMonth.value = `${year}-${String(activeMonth.value).padStart(2, '0')}`
  view.value = 'month'
}

const headingRowSx = computed(() => stylex.props(styles.headingRow))
const headingButtonSx = computed(() => stylex.props(styles.headingButton, focus.subtle))
const panelGridSx = computed(() => stylex.props(styles.panelGrid))
const panelCellSx = computed(() => stylex.props(styles.panelCell, focus.subtle))
const panelCellActiveSx = computed(() => stylex.props(styles.panelCell, styles.panelCellActive, focus.subtle))
</script>

<template>
  <DatePicker
    v-bind="omitClassStyle($attrs)"
    mode="range"
    :value="value"
    :default-value="defaultValue"
    :open="open"
    :default-open="defaultOpen"
    :month="viewMonth"
    @update:month="viewMonth = $event"
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
    :start-name="startName"
    :end-name="endName"
    :form="form"
    :class="[fieldSx.className, $attrs.class]"
    :style="[fieldSx.style, $attrs.style]"
  >
    <DatePickerInput
      :aria-label="startAriaLabel"
      :placeholder="startPlaceholder"
      :class="inputSx.className"
      :style="inputSx.style"
    />
    <span :class="separatorSx.className" :style="separatorSx.style" aria-hidden="true">–</span>
    <DatePickerInput
      end
      :aria-label="endAriaLabel"
      :placeholder="endPlaceholder"
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
      aria-label="选择日期范围"
      :side="side"
      :align="align"
      :side-offset="sideOffset ?? 6"
      :class="contentSx.className"
      :style="contentSx.style"
    >
      <div :class="headerSx.className" :style="headerSx.style">
        <button
          type="button"
          :aria-label="prevLabel"
          :class="navSx.className"
          :style="navSx.style"
          @click="shift(-1)"
        >
          <ChevronLeftIcon :size="16" aria-hidden="true" />
        </button>
        <div :class="headingRowSx.className" :style="headingRowSx.style">
          <button
            type="button"
            :aria-label="`选择年份，当前 ${activeYear} 年`"
            :class="headingButtonSx.className"
            :style="headingButtonSx.style"
            @click="view = view === 'year' ? 'day' : 'year'"
          >
            {{ activeYear }} 年
          </button>
          <button
            type="button"
            :aria-label="`选择月份，当前 ${activeMonth} 月`"
            :class="headingButtonSx.className"
            :style="headingButtonSx.style"
            @click="view = view === 'month' ? 'day' : 'month'"
          >
            {{ activeMonth }} 月
          </button>
        </div>
        <button
          type="button"
          :aria-label="nextLabel"
          :class="[navSx.className, nextSx.className]"
          :style="[navSx.style, nextSx.style]"
          @click="shift(1)"
        >
          <ChevronRightIcon :size="16" aria-hidden="true" />
        </button>
      </div>

      <div v-if="view === 'month'" :class="panelGridSx.className" :style="panelGridSx.style">
        <button
          v-for="item in monthNames"
          :key="item.month"
          type="button"
          :class="item.month === activeMonth ? panelCellActiveSx.className : panelCellSx.className"
          :style="item.month === activeMonth ? panelCellActiveSx.style : panelCellSx.style"
          @click="chooseMonth(item.month)"
        >
          {{ item.label }}
        </button>
      </div>

      <div v-else-if="view === 'year'" :class="panelGridSx.className" :style="panelGridSx.style">
        <button
          v-for="year in yearCells"
          :key="year"
          type="button"
          :class="year === activeYear ? panelCellActiveSx.className : panelCellSx.className"
          :style="year === activeYear ? panelCellActiveSx.style : panelCellSx.style"
          @click="chooseYear(year)"
        >
          {{ year }}
        </button>
      </div>

      <div v-else :class="gridsSx.className" :style="gridsSx.style">
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
            ><span>{{ dayNumber(cell.date) }}</span></CalendarDay>
          </CalendarWeeks>
        </CalendarGrid>
      </div>
    </DatePickerContent>
  </DatePicker>
</template>
