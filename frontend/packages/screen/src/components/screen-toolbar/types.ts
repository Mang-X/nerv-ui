export interface ScreenToolbarProps {
  /** Accessible name of the toolbar. */
  ariaLabel?: string
  /** Dim the whole group, e.g. while a query is in flight. */
  disabled?: boolean
  /** `wrap` lets groups flow onto a second line; `scroll` keeps one row and scrolls. */
  overflow?: 'wrap' | 'scroll'
}
