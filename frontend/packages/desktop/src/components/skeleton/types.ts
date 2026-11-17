export type NvSkeletonShape = 'rect' | 'circle' | 'text'
export type NvSkeletonAnimation = 'pulse' | 'none'

export interface NvSkeletonProps {
  shape?: NvSkeletonShape
  /** CSS width. Defaults to a shape-dependent value. */
  width?: string | number
  /** CSS height. Defaults to a shape-dependent value. */
  height?: string | number
  animation?: NvSkeletonAnimation
  /** Rendered text lines when `shape="text"`. */
  lines?: number
  /** Announced while loading. Without it the placeholder is hidden from assistive technology. */
  label?: string
}
