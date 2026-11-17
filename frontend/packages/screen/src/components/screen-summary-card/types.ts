export type SummaryCardVariant = 'default' | 'compact' | 'feature'

export type SummaryTone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

export interface SummaryMetric {
  key?: string | number
  label: string
  value?: number | string | null
  unit?: string
  tone?: SummaryTone
}

export interface SummaryStatus {
  label: string
  tone: SummaryTone
}

/** One label/value pair on the comparison line. */
export interface SummaryComparison {
  key?: string | number
  label: string
  value: string | number
  tone?: SummaryTone
}
