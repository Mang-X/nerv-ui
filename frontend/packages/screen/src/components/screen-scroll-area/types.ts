export type ScrollAreaRowKey<T = unknown> = (item: T, index: number) => string | number

export interface ScreenScrollAreaProps {
  /** Pixels per second for the seamless loop; 0 stays static. */
  speed?: number
  pauseOnHover?: boolean
  /** Stable row identity for the v-for keys. */
  rowKey?: ScrollAreaRowKey
  /** Accessible region name for the scrollable list. */
  ariaLabel?: string
  emptyLabel?: string
}
