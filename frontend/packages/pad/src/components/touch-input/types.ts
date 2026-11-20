export type TouchInputMode =
  | 'text'
  | 'search'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'none'

export interface TouchInputProps {
  /** Controlled value (`v-model`). */
  modelValue?: string
  /** Value the input starts with when uncontrolled. */
  defaultValue?: string
  type?: string
  placeholder?: string
  /** Visible label above the field. */
  label?: string
  /** Helper text below the field; also shown in the danger tone when `invalid`. */
  hint?: string
  name?: string
  autocomplete?: string
  inputMode?: TouchInputMode
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Marks the control invalid: `aria-invalid` plus the danger border. */
  invalid?: boolean
  /** Renders the built-in clear button while the input holds text. */
  clearable?: boolean
  /** Accessible name for the clear button. */
  clearLabel?: string
}

export interface TouchInputSlots {
  /** Short text or an icon before the input. Presses focus the input. */
  prefix?: () => unknown
  /** Short text or an icon after the input. Presses focus the input. */
  suffix?: () => unknown
}
