import type { ActionDetails } from '@ui-sdk/core'

export interface NvDialogProps {
  /** Controlled open state (`v-model:open`). */
  open?: boolean
  defaultOpen?: boolean
  /** `true` traps focus and makes the page inert; `"trap-focus"` only traps focus. */
  modal?: boolean | 'trap-focus'
  /** Whether Escape and outside presses can close it. */
  dismissible?: boolean
  closeOnOutsidePress?: boolean
}

export interface NvDialogTriggerProps {
  disabled?: boolean
  /** Keeps a disabled trigger focusable so a tooltip can explain why. */
  focusableWhenDisabled?: boolean
}

export interface NvDialogContentProps {
  /** Keeps the content in the page while closed, for custom exit animation. */
  keepMounted?: boolean
}

export interface NvDialogCloseProps {
  /** Reported as `returnValue` in `@open-change`. */
  value?: string
  /** Runs before closing; returning a Promise keeps the dialog open until it settles. */
  action?: (event: Event | undefined, details: ActionDetails) => unknown
}
