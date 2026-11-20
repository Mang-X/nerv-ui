export type MobileSkeletonShape = 'rect' | 'circle' | 'text'

export interface MobileSkeletonProps {
  shape?: MobileSkeletonShape
  /** CSS width. Defaults to a shape-dependent value. */
  width?: string | number
  /** CSS height. Defaults to a shape-dependent value. */
  height?: string | number
  animation?: 'pulse' | 'none'
  /** Rendered text lines when `shape="text"`. */
  lines?: number
  /** Announced while loading. Without it the placeholder is hidden from AT. */
  label?: string
}
