export interface TouchKeypadProps {
  /** Controlled value (`v-model`). */
  modelValue?: string
  /** Value the keypad starts with when uncontrolled. */
  defaultValue?: string
  /** Shows the decimal key and accepts ".". */
  allowDecimal?: boolean
  /** Shows the sign key and accepts a leading "-". */
  allowNegative?: boolean
  /** Longest value the keypad accepts, in characters. */
  maxLength?: number
  disabled?: boolean
  /** Shows the readout above the keys. */
  display?: boolean
  /** Text shown in the readout while the value is empty. */
  placeholder?: string
  /** Shows the wide confirm button. */
  showConfirm?: boolean
  /** Shows the wide clear button. */
  showClear?: boolean
  confirmLabel?: string
  clearLabel?: string
  deleteLabel?: string
  signLabel?: string
}

export interface TouchKeypadSlots {
  /** Replaces the readout. */
  display?: () => unknown
  /** Replaces the action row. */
  actions?: () => unknown
}
