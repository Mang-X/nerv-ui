/** md = 480px panel, lg = 640px panel. */
export type TouchDialogSize = 'md' | 'lg'

export interface TouchDialogProps {
  /** Controlled open state (`v-model:open` or `v-model`). */
  open?: boolean
  /** Open on first render when uncontrolled. */
  defaultOpen?: boolean
  /** `true` traps focus and makes the page inert; `"trap-focus"` only traps focus. */
  modal?: boolean | 'trap-focus'
  /** Whether Escape and outside presses can close it. */
  dismissible?: boolean
  closeOnOutsidePress?: boolean
  /** Keeps the content in the page while closed, for custom exit animation. */
  keepMounted?: boolean
  /** Heading that names the dialog. */
  title?: string
  /** Supporting paragraph under the heading. */
  description?: string
  /** Shows the built-in header close button. */
  closable?: boolean
  /** Accessible name for the close button. */
  closeLabel?: string
  size?: TouchDialogSize
}
