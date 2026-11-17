export interface TouchSelectOption {
  value: string
  label: string
  disabled?: boolean
}

/** One value, a list with `multiple`, or nothing selected. */
export type TouchSelectValue = string | string[] | null

/** md = 56px, lg = 64px trigger height. */
export type TouchSelectSize = 'md' | 'lg'

export interface TouchSelectProps {
  /** Options to render in the popup, also used to resolve the trigger label. */
  options: TouchSelectOption[]
  /** Controlled value (`v-model`). An array when `multiple`. */
  modelValue?: TouchSelectValue
  /** Value selected first when uncontrolled. */
  defaultValue?: TouchSelectValue
  /** Selects several items; the value becomes an array. */
  multiple?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Name the value submits under. */
  name?: string
  /** Visible label above the trigger. */
  label?: string
  /** Shown by the trigger while nothing is selected. */
  placeholder?: string
  /** With `multiple`, how many labels show before the rest are counted. */
  maxLabels?: number
  /** Text shown when `options` is empty. */
  emptyLabel?: string
  size?: TouchSelectSize
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}
