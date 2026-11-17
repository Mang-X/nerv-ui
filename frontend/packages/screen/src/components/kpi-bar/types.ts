export type KpiTone = 'default' | 'accent' | 'success' | 'warning' | 'danger'
export type KpiTrend = 'up' | 'down' | 'flat'

export interface KpiItem {
  label: string
  value: string | number
  unit?: string
  hint?: string
  trend?: KpiTrend
  tone?: KpiTone
}

export type KpiBarSize = 'md' | 'lg'
