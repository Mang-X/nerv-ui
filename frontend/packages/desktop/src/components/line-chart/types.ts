import type { ChartPoint, ChartSeries } from '../chart/types'

export type { ChartPoint, ChartSeries }

export interface NvLineChartProps {
  /** Series to draw. Each point's `x` is a category label shared across series. */
  data: ChartSeries[]
  /** Plot height in px. The legend row is added above it. */
  height?: number
  /** Show the series legend above the plot. */
  showLegend?: boolean
  /** Accessible name for the chart as a whole. */
  ariaLabel?: string
  /** Also fill the area under each line. */
  area?: boolean
  /** Appended to values in the tooltip, e.g. `" 件"`. */
  valueSuffix?: string
}
