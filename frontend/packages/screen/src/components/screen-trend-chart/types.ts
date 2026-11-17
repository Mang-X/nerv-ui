export type TrendChartTone = 'accent' | 'success' | 'warning' | 'danger' | 'muted'

export interface ScreenTrendSeries {
  label: string
  tone?: TrendChartTone
  /** Y samples; `null` breaks the line into a gap. */
  data: ReadonlyArray<number | null>
}
