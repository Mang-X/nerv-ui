import type { ActionDetails } from '@ui-sdk/core'

export interface NvAlertDialogProps {
  /** Controlled open state (`v-model:open`). */
  open?: boolean
  defaultOpen?: boolean
  /** Whether Escape and Android back can dismiss it. Outside presses never do. */
  dismissible?: boolean
}

export interface NvAlertDialogTriggerProps {
  disabled?: boolean
  focusableWhenDisabled?: boolean
}

export interface NvAlertDialogContentProps {
  keepMounted?: boolean
}

export interface NvAlertDialogCloseProps {
  /** Reported as `returnValue` in `@open-change`. */
  value?: string
  /** Runs before closing; returning a Promise keeps the dialog open until it settles. */
  action?: (event: Event | undefined, details: ActionDetails) => unknown
}
