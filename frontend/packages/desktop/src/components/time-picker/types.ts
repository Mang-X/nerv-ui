import type { TimeInputGranularity } from '@ui-sdk/vue/time-input'

export type NvTimePickerGranularity = TimeInputGranularity
export type NvTimePickerHourCycle = 12 | 24

export interface NvTimePickerProps {
  /** Controlled value (`v-model:value`): `"14:30"`, `"14:30:15"`, or `null`. */
  value?: string | null
  defaultValue?: string | null
  /** The smallest unit shown; `"second"` adds seconds. */
  granularity?: NvTimePickerGranularity
  /** 12 or 24 hour clock. Defaults to the locale's. */
  hourCycle?: NvTimePickerHourCycle
  /** The earliest time, like `"09:00"`. */
  min?: string
  /** The latest time, like `"17:30"`. */
  max?: string
  locale?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Name the time submits under. */
  name?: string
  form?: string
}
