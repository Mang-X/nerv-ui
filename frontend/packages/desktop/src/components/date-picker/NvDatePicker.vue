<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
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
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, watch } from 'vue'
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
  yearLabel: '年份',
  monthLabel: '月份',
  // Optional Booleans default to false when omitted, which would make the
  // wrapper pass a controlled `open`/`closeOnSelect` the caller never asked for.
  open: undefined,
  disabled: undefined,
  readOnly: undefined,
  required: undefined,
  fixedWeeks: undefined,
  showOutsideDays: undefined,
  closeOnSelect: undefined,
  months: 1,
  side: 'bottom',
  align: 'start',
})

// Every `onUpdate:*` listener arrives through $attrs and is forwarded untouched:
// ui-sdk primitives treat an attached update listener as a controller, so the
// wrapper must never attach one the caller didn't ask for.
const fieldSx = computed(() => stylex.props(styles.field, focus.ring))
const inputSx = computed(() => stylex.props(styles.input))
const triggerSx = computed(() => stylex.props(styles.trigger, focus.ring))
const clearSx = computed(() => stylex.props(styles.clear, focus.subtle))
const contentSx = computed(() => stylex.props(glass.surface, styles.content, presence.fadeZoom))
const headerSx = computed(() => stylex.props(styles.header))
const navSx = computed(() => stylex.props(styles.nav, focus.subtle))
const nextSx = computed(() => stylex.props(styles.navNext))
const gridsSx = computed(() => stylex.props(styles.grids))
const gridSx = computed(() => stylex.props(styles.grid))
const weekdaySx = computed(() => stylex.props(styles.weekday))
const daySx = computed(() => stylex.props(styles.day, focus.subtle))

const gridOffsets = computed(() => Array.from({ length: props.months }, (_, index) => index))

/**
 * 三视图（日 / 月 / 年）。ui-sdk 只给「日」网格，月与年网格在这里自绘：
 * 头部点「年」→ 年视图，点「月」→ 月视图；选完自动回到日视图。
 * `viewMonth` 受控传回 DatePicker，翻页/选择都经过它，两个视图共享同一个月。
 */
type CalendarView = 'day' | 'month' | 'year'
const view = ref<CalendarView>('day')

function initialMonth(): string {
  const source = props.month ?? props.defaultMonth
  if (source) return source
  const value = props.value ?? props.defaultValue
  if (typeof value === 'string' && value.length >= 7) return value.slice(0, 7)
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
  Array.from({ length: 12 }, (_, i) => {
    const label = new Intl.DateTimeFormat(props.locale ?? 'zh-CN', { month: 'long' }).format(
      new Date(2020, i, 1),
    )
    return { month: i + 1, label }
  }),
)
/** 年视图每屏 12 年，从 decade 起始年排起。 */
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

/** `YYYY-MM-DD` → 日序号。ui-sdk 用 Intl 的 `day: numeric`，中文会带上「日」，格子里只要数字。 */
function dayNumber(iso: string) {
  return Number(iso.slice(8, 10))
}
</script>

<template>
  <DatePicker
    v-bind="omitClassStyle($attrs)"
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
      <NvIcon name="close" :size="14" />
    </DatePickerClear>
    <DatePickerTrigger
      :aria-label="triggerLabel"
      :class="triggerSx.className"
      :style="triggerSx.style"
    >
      <NvIcon name="calendar" :size="16" />
    </DatePickerTrigger>
    <DatePickerContent
      aria-label="选择日期"
      :side="side"
      :align="align"
      :side-offset="sideOffset ?? 6"
      :class="contentSx.className"
      :style="contentSx.style"
    >
      <div :class="headerSx.className" :style="headerSx.style">
        <Button
          type="button"
          :aria-label="prevLabel"
          :class="navSx.className"
          :style="navSx.style"
          @click="shift(-1)"
        >
          <NvIcon name="chevron-left" :size="16" />
        </Button>
        <div :class="headingRowSx.className" :style="headingRowSx.style">
          <Button
            type="button"
            :aria-label="`选择年份，当前 ${activeYear} 年`"
            :class="headingButtonSx.className"
            :style="headingButtonSx.style"
            @click="view = view === 'year' ? 'day' : 'year'"
          >
            {{ activeYear }} 年
          </Button>
          <Button
            type="button"
            :aria-label="`选择月份，当前 ${activeMonth} 月`"
            :class="headingButtonSx.className"
            :style="headingButtonSx.style"
            @click="view = view === 'month' ? 'day' : 'month'"
          >
            {{ activeMonth }} 月
          </Button>
        </div>
        <Button
          type="button"
          :aria-label="nextLabel"
          :class="[navSx.className, nextSx.className]"
          :style="[navSx.style, nextSx.style]"
          @click="shift(1)"
        >
          <NvIcon name="chevron-right" :size="16" />
        </Button>
      </div>

      <!-- 月视图：选中即回到日视图 -->
      <div v-if="view === 'month'" :class="panelGridSx.className" :style="panelGridSx.style">
        <Button
          v-for="item in monthNames"
          :key="item.month"
          type="button"
          :class="
            item.month === activeMonth
              ? panelCellActiveSx.className
              : panelCellSx.className
          "
          :style="item.month === activeMonth ? panelCellActiveSx.style : panelCellSx.style"
          @click="chooseMonth(item.month)"
        >
          {{ item.label }}
        </Button>
      </div>

      <!-- 年视图：一屏 12 年，选中后进入该年的月视图 -->
      <div v-else-if="view === 'year'" :class="panelGridSx.className" :style="panelGridSx.style">
        <Button
          v-for="year in yearCells"
          :key="year"
          type="button"
          :class="year === activeYear ? panelCellActiveSx.className : panelCellSx.className"
          :style="year === activeYear ? panelCellActiveSx.style : panelCellSx.style"
          @click="chooseYear(year)"
        >
          {{ year }}
        </Button>
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
