export type NvPaginationSize = 'sm' | 'md'

export interface NvPaginationProps {
  /** Controlled current page (`v-model:page`), from 1. */
  page?: number
  /** Page shown at first, when uncontrolled. */
  defaultPage?: number
  /** How many pages there are. Or pass `total` and `pageSize`. */
  pageCount?: number
  total?: number
  pageSize?: number
  /** Pages shown on each side of the current one. */
  siblings?: number
  /** Pages always shown at each end. */
  boundaries?: number
  /** URL builder; makes page parts real links instead of buttons. */
  getHref?: (page: number) => string
  /** Accessible name for the navigation landmark. */
  label?: string
  /** Shows first/last jumps at either end. */
  showEdges?: boolean
  prevLabel?: string
  nextLabel?: string
  firstLabel?: string
  lastLabel?: string
  size?: NvPaginationSize
}
