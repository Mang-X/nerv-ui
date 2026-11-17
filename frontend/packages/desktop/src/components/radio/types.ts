export interface NvRadioGroupProps {
  /** Controlled value (`v-model:value`). */
  value?: string | null
  defaultValue?: string | null
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Name the value submits under. */
  name?: string
}

export interface NvRadioProps {
  /** The value this radio selects in its group. */
  value: string
  disabled?: boolean
  /** Optional text rendered after the indicator. The default slot takes precedence. */
  label?: string
}
