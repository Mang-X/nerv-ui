export type StatusCardTone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

export interface StatusCardMetric {
  key?: string | number
  label: string
  value: string | number
  unit?: string
  tone?: StatusCardTone
}
