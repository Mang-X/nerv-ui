/**
 * Shared public types for the Nv chart family. Each chart re-exports these so
 * consumers can import them from the package root without knowing the
 * internal layout.
 */

/** One point inside a chart series. `x` is a category label or numeric position. */
export interface ChartPoint {
  x: string | number
  y: number
}

/** A named data series shared by the line and bar charts. */
export interface ChartSeries {
  key: string
  label: string
  /** Semantic color override; defaults to the token-derived chart palette. */
  color?: string
  data: ChartPoint[]
}
