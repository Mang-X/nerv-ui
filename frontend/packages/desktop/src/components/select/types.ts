import type { ListData } from '@ui-sdk/vue/select'

export type NvSelectModelValue = string | string[] | null

export interface NvSelectProps {
  /** Controlled value (`v-model:value`). An array when `multiple`. */
  value?: NvSelectModelValue
  defaultValue?: NvSelectModelValue
  /** Selects several items; the value becomes an array. */
  multiple?: boolean
  /** Controlled open state (`v-model:open`). */
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Name the value submits under. */
  name?: string
  /** Shown by `NvSelectValue` while nothing is selected. */
  placeholder?: string
  /** Options as data, so labels resolve before the list ever opens. */
  items?: ListData
}

export interface NvSelectTriggerProps {
  disabled?: boolean
  /** Hides the built-in chevron when you render your own indicator. */
  hideChevron?: boolean
}

export interface NvSelectContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

export interface NvSelectItemProps {
  value: string
  /** Text the trigger shows when the item content is not plain text. */
  label?: string
  disabled?: boolean
}

export interface NvSelectValueProps {
  placeholder?: string
  /** With `multiple`, how many labels show before the rest are counted. */
  maxLabels?: number
}

export interface NvSelectLabelProps {
  /** Optional id; the trigger wires itself to this label automatically. */
  id?: string
}
