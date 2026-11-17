export interface MobileSliderProps {
  /** Controlled value (`v-model`): a number. Leave undefined for uncontrolled use. */
  modelValue?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readonly?: boolean
  /** Renders the formatted value to the right of the track. */
  showValue?: boolean
  ariaLabel?: string
}
