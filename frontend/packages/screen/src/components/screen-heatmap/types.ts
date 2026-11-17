export type HeatmapTone = 'accent' | 'success' | 'warning' | 'danger'

export interface ScreenHeatmapBand {
  label: string
  tone: HeatmapTone
  /** Inclusive lower bound; the next greater `min` is the exclusive upper bound. */
  min: number
}

export interface ScreenHeatmapCell {
  /** Unique, stable identity within the grid; labels may repeat. */
  key: string | number
  label: string
  value?: number | null
}
