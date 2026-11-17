export type TouchSwitchLabelPosition = 'start' | 'end'

export interface TouchSwitchProps {
  /** Controlled on/off state (`v-model`). */
  modelValue?: boolean
  /** State when uncontrolled. */
  defaultChecked?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Name the value submits under. */
  name?: string
  /** What it submits while on. */
  value?: string
  /** Visible label next to the track. */
  label?: string
  /** Where the label sits relative to the track. */
  labelPosition?: TouchSwitchLabelPosition
  /** Accessible name when there is no visible label. */
  'aria-label'?: string
}
