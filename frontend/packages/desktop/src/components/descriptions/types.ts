export type NvDescriptionsLayout = 'horizontal' | 'vertical'

export interface NvDescriptionsProps {
  /** Number of label/value columns. */
  columns?: number
  /** Places the label beside the value or above it. */
  layout?: NvDescriptionsLayout
  /** Draws hairline separators between cells. */
  bordered?: boolean
  /** Width of the label column in horizontal layout. */
  labelWidth?: number | string
}

export interface NvDescriptionsItemProps {
  label: string
  /** Fallback value. The default slot takes precedence. */
  value?: string | number
  /** How many columns the item spans. */
  span?: number
}
