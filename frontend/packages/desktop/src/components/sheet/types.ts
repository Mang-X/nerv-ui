import type { ActionDetails } from '@ui-sdk/core'

export type SheetSide = 'top' | 'right' | 'bottom' | 'left' | 'start' | 'end'

export interface NvSheetProps {
  /** Controlled open state (`v-model:open`). */
  open?: boolean
  defaultOpen?: boolean
  /** Edge the sheet slides in from. Defaults to the right. */
  side?: SheetSide
  modal?: boolean | 'trap-focus'
  dismissible?: boolean
}

export interface NvSheetTriggerProps {
  disabled?: boolean
  focusableWhenDisabled?: boolean
}

export interface NvSheetContentProps {
  keepMounted?: boolean
}

export interface NvSheetCloseProps {
  /** Reported as `returnValue` in `@open-change`. */
  value?: string
  /** Runs before closing; returning a Promise keeps the sheet open until it settles. */
  action?: (event: Event | undefined, details: ActionDetails) => unknown
}
