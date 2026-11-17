export type NvTimelineStatus = 'default' | 'active' | 'danger'

export interface NvTimelineProps {
  /** Accessible name for the timeline. */
  label?: string
}

export interface NvTimelineItemProps {
  /** Timestamp text, rendered inside a `<time>` element. */
  time?: string
  /** Machine-readable timestamp for the `<time>` element. */
  datetime?: string
  title?: string
  description?: string
  /** Dot and rail color. */
  status?: NvTimelineStatus
  /** Makes the title a link. */
  href?: string
}
