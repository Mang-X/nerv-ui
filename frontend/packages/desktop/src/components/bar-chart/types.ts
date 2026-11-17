import type { ChartPoint, ChartSeries } from '../chart/types'

export type { ChartPoint, ChartSeries }

export interface NvBarChartProps {
  /** Series to draw. Categories are the union of every point's `x`. */
  data: ChartSeries[]
  /** Plot height in px. The legend row is added above it. */
  height?: number
  /** Show the series legend above the plot. */
  showLegend?: boolean
  /** Accessible name for the chart as a whole. */
  ariaLabel?: string
  /** Appended to values in the tooltip, e.g. `" 件"`. */
  valueSuffix?: string
}
