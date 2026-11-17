export type NvBadgeVariant = 'neutral' | 'brand' | 'danger' | 'outline' | 'ghost'
export type NvBadgeSize = 'sm' | 'md'

export interface NvBadgeProps {
  /** Visual tone. Business status semantics use the dedicated status badge family. */
  variant?: NvBadgeVariant
  size?: NvBadgeSize
  /** Shows a small tone-colored dot before the content, for counts and filters. */
  dot?: boolean
  /** Fully rounded pill. */
  round?: boolean
}
