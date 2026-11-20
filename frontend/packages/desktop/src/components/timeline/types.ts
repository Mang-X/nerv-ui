export type NvTimelineStatus = 'complete' | 'current' | 'upcoming'

/** 视觉语气。与流程状态正交：一个「current」的事件也可以是警示色的。 */
export type NvTimelineTone = 'default' | 'danger'

export interface NvTimelineProps {
  /** Accessible name for the timeline. */
  label?: string
}

export interface NvTimelineItemProps {
  /** Names the event for `focus()` and the agent bridge. Generated when left out. */
  value?: string
  /** Timestamp text, rendered inside a `<time>` element. */
  time?: string
  /** Machine-readable timestamp for the `<time>` element. */
  datetime?: string
  title?: string
  description?: string
  /** Where the event stands in the process. */
  status?: NvTimelineStatus
  /** Dot color, independent of `status`. */
  tone?: NvTimelineTone
  /** Makes the title a link. */
  href?: string
}
