export type MobileProgressSize = 'sm' | 'md' | 'lg'
export type MobileProgressVariant = 'brand' | 'danger' | 'neutral'

export interface MobileProgressProps {
  /** How far the task has come. `null` renders the indeterminate bar. */
  value?: number | null
  min?: number
  max?: number
  label?: string
  showValue?: boolean
  size?: MobileProgressSize
  variant?: MobileProgressVariant
}
