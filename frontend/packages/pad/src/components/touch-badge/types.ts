export type TouchBadgeVariant = 'neutral' | 'brand' | 'danger' | 'outline' | 'ghost'
export type TouchBadgeSize = 'md' | 'lg'

export interface TouchBadgeProps {
  /** Visual tone. Business status semantics use the dedicated status badge family. */
  variant?: TouchBadgeVariant
  size?: TouchBadgeSize
  /** Shows a small tone-colored dot before the content, for counts and filters. */
  dot?: boolean
  /** Fully rounded pill. */
  round?: boolean
}
