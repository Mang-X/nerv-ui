export type NvScrollAreaOrientation = 'vertical' | 'horizontal' | 'both'
export type NvScrollAreaType = 'auto' | 'always' | 'scroll' | 'hover'

export interface NvScrollAreaProps {
  /** Which scrollbars to render. */
  orientation?: NvScrollAreaOrientation
  /** When scrollbars show: whenever needed, always, while scrolling, or on hover. */
  type?: NvScrollAreaType
  /** How long scrollbars stay after they stop being needed, in ms. */
  scrollHideDelay?: number
  /** Keeps the end in view while content grows. */
  stickToEnd?: boolean
  /** Fixed height of the scrolling region. */
  height?: number | string
  /** Maximum height of the scrolling region. */
  maxHeight?: number | string
  /** Accessible name for the scrolling region. */
  label?: string
  /** Renders only the visible window of `itemCount` rows. Requires `itemSize` + `itemCount`. */
  virtual?: boolean
  /** Fixed row height in px for `virtual` mode. */
  itemSize?: number
  /** Total row count for `virtual` mode. */
  itemCount?: number
  /** Extra rows rendered above and below the window. Defaults to 4. */
  overscan?: number
}
