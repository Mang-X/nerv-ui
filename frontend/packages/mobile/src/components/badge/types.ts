export interface NvMobileBadgeProps {
  /** 计数值。0 且未开 `dot` 时不显示。 */
  count?: number
  /** 只显示一个小圆点，不显示数字。 */
  dot?: boolean
  /** 超过这个数显示 `{max}+`。 */
  max?: number
}
