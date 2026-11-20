export type NvInputSize = 'sm' | 'md' | 'lg'

export interface NvInputProps {
  /** Controlled value (`v-model`). */
  modelValue?: string
  /** Value the input starts with when uncontrolled. */
  defaultValue?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Marks the control invalid: `aria-invalid` plus the danger border. */
  invalid?: boolean
  /** Renders the built-in clear button while the input holds text. */
  clearable?: boolean
  /** Accessible name for the clear button. */
  clearLabel?: string
  size?: NvInputSize
}

export interface NvInputSlots {
  /** Short text or an icon before the input. Presses focus the input. */
  prefix?: () => unknown
  /** Short text or an icon after the input. Presses focus the input. */
  suffix?: () => unknown
}
