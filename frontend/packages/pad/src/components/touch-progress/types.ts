export type TouchProgressSize = 'md' | 'lg'
export type TouchProgressTone = 'brand' | 'danger' | 'neutral'

export interface TouchProgressProps {
  /** How far the task has come. `null` renders the indeterminate bar. */
  value?: number | null
  min?: number
  max?: number
  /** Visible label above the bar. */
  label?: string
  /** Shows the formatted value at the end of the label row. */
  showValue?: boolean
  size?: TouchProgressSize
  tone?: TouchProgressTone
}
