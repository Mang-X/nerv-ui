import type { DateMatchers, DatePickerValue } from '@ui-sdk/vue/date-picker'

export type NvDatePickerValue = DatePickerValue
export type NvDateRangeValue = [string, string] | null
export type NvDatePickerSide = 'top' | 'right' | 'bottom' | 'left'
export type NvDatePickerAlign = 'start' | 'center' | 'end'
export type NvDatePickerWeekdayFormat = 'long' | 'narrow' | 'short'

export interface NvDatePickerProps {
  /** Controlled value (`v-model:value`): an ISO date, or `null`. */
  value?: DatePickerValue
  defaultValue?: DatePickerValue
  /** Controlled open state (`v-model:open`). */
  open?: boolean
  defaultOpen?: boolean
  /** The first month shown, like `"2026-10"`. */
  month?: string
  defaultMonth?: string
  /** The earliest date that can be picked. */
  min?: string
  /** The latest date that can be picked. */
  max?: string
  /** Dates that cannot be picked, as ISO dates, ranges or a predicate. */
  unavailable?: DateMatchers
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Language of the date format, month names and labels. */
  locale?: string
  /** First day of the week, 0 for Sunday. */
  weekStartsOn?: number
  weekdayFormat?: NvDatePickerWeekdayFormat
  monthFormat?: 'long' | 'narrow' | 'short'
  fixedWeeks?: boolean
  showOutsideDays?: boolean
  /** How many month grids show side by side. */
  months?: number
  pageBy?: 'month' | 'page'
  /** Whether picking a date closes the popup. */
  closeOnSelect?: boolean
  /** Today's date, for `aria-current` and the starting month. */
  today?: string
  timeZone?: string
  /** Name the ISO date submits under. */
  name?: string
  form?: string
  placeholder?: string
  /** Accessible name for the date field. */
  ariaLabel?: string
  /** Shows a clear button while a date is selected. */
  clearable?: boolean
  clearLabel?: string
  /** Accessible name for the calendar trigger. */
  triggerLabel?: string
  prevLabel?: string
  nextLabel?: string
  side?: NvDatePickerSide
  align?: NvDatePickerAlign
  sideOffset?: number
}

export interface NvDateRangePickerProps {
  /** Controlled value (`v-model:value`): `[start, end]`, or `null`. */
  value?: NvDateRangeValue
  defaultValue?: NvDateRangeValue
  open?: boolean
  defaultOpen?: boolean
  month?: string
  defaultMonth?: string
  min?: string
  max?: string
  unavailable?: DateMatchers
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  locale?: string
  weekStartsOn?: number
  weekdayFormat?: NvDatePickerWeekdayFormat
  monthFormat?: 'long' | 'narrow' | 'short'
  fixedWeeks?: boolean
  showOutsideDays?: boolean
  /** How many month grids show side by side. Defaults to 2. */
  months?: number
  pageBy?: 'month' | 'page'
  closeOnSelect?: boolean
  today?: string
  timeZone?: string
  name?: string
  startName?: string
  endName?: string
  form?: string
  startPlaceholder?: string
  endPlaceholder?: string
  startAriaLabel?: string
  endAriaLabel?: string
  clearable?: boolean
  clearLabel?: string
  triggerLabel?: string
  prevLabel?: string
  nextLabel?: string
  side?: NvDatePickerSide
  align?: NvDatePickerAlign
  sideOffset?: number
}
