export type NvCheckedState = boolean | 'indeterminate'

export interface NvCheckboxProps {
  /** Controlled checked state (`v-model:checked`). */
  checked?: NvCheckedState
  defaultChecked?: NvCheckedState
  disabled?: boolean
  required?: boolean
  /** Name the value submits under. */
  name?: string
  /** Optional text rendered after the box. The default slot takes precedence. */
  label?: string
  /** Id shared by the control and its label. Generated when omitted. */
  id?: string
}
