export type ParetoTone = 'accent' | 'success' | 'warning' | 'danger'

export interface ScreenParetoItem {
  key?: string | number
  label: string
  /** Category count; only finite non-negative values take part. */
  value: number
  /** Optional secondary source line, e.g. the line name. */
  sub?: string
  tone?: ParetoTone
}
