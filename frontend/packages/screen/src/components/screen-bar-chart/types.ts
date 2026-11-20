export type BarChartTone = 'accent' | 'success' | 'warning' | 'danger' | 'muted'

export interface ScreenBarSeries {
  label: string
  tone?: BarChartTone
  /** One value per category; `null` leaves a gap. */
  data: ReadonlyArray<number | null>
}
