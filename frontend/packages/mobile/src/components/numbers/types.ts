export interface MobileNumbersProps {
  /** Controlled value (`v-model`). `null` means the field is empty. Leave undefined for uncontrolled use. */
  modelValue?: number | null
  defaultValue?: number | null
  min?: number
  max?: number
  step?: number
  largeStep?: number
  disabled?: boolean
  readonly?: boolean
  /** Name the number submits under. */
  name?: string
  /** Accessible label for the input and the step buttons. */
  label?: string
  incrementLabel?: string
  decrementLabel?: string
  /** Shows the leading minus button. */
  showDecrement?: boolean
  /** Shows the trailing plus button. */
  showIncrement?: boolean
}
