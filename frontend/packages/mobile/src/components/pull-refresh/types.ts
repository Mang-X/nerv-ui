export interface PullRefreshProps {
  /**
   * Whether a refresh is in flight. Pass it to control the indicator; leave
   * undefined for uncontrolled use.
   */
  refreshing?: boolean
  /** How far the content must be pulled, in px, before a refresh fires. */
  threshold?: number
  /** Caps how far the content follows the finger, in px. */
  maxPull?: number
  /** Text shown while pulling, before the threshold is crossed. */
  pullText?: string
  /** Text shown once the pull passes the threshold. */
  releaseText?: string
  /** Text shown while refreshing. */
  refreshingText?: string
  disabled?: boolean
}
