export interface NvSwitchProps {
  /** Controlled on/off state (`v-model:checked`). */
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  required?: boolean
  /** Name the value submits under. */
  name?: string
}
