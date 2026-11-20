export interface NvMobileStepperProps {
  /** 受控值（`v-model`）。 */
  modelValue?: number
  min?: number
  max?: number
  /** 每按一次增减多少。 */
  step?: number
  disabled?: boolean
  /** 数字框的无障碍名称；没有可见标签时必须给。 */
  label?: string
}
