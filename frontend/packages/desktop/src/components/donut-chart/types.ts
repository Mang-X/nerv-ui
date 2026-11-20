export interface NvDonutDatum {
  label: string
  value: number
  /** Semantic color override; defaults to the token-derived chart palette. */
  color?: string
}

export interface NvDonutChartProps {
  /** Slices in display order. Negative or non-finite values are ignored. */
  data: NvDonutDatum[]
  /** Plot height in px. The legend sits below the ring. */
  height?: number
  /** Show the slice legend below the ring. */
  showLegend?: boolean
  /** Accessible name for the chart as a whole. */
  ariaLabel?: string
  /** Center headline. Defaults to the total value. */
  centralLabel?: string
  /** Caption under the center headline. Defaults to `总计`. */
  centralSubLabel?: string
}
