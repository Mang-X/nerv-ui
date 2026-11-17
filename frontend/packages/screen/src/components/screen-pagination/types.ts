export type ScreenPaginationSize = 'md' | 'lg'

export interface ScreenPaginationProps {
  /** Controlled current page (`v-model:page`), 1-based. */
  page?: number
  defaultPage?: number
  /** Total number of pages, or pass `total` + `pageSize`. */
  pageCount?: number
  total?: number
  pageSize?: number
  /** Pages shown on each side of the current one. */
  siblings?: number
  /** Pages always shown at each end. */
  boundaries?: number
  label?: string
  prevLabel?: string
  nextLabel?: string
  firstLabel?: string
  lastLabel?: string
  showEdges?: boolean
  size?: ScreenPaginationSize
  /** Hide the “共 N 条 · x–y” readout. */
  hideSummary?: boolean
}
