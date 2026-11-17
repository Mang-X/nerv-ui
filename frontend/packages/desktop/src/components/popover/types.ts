export interface NvPopoverProps {
  /** Controlled open state (`v-model:open`). */
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean | 'trap-focus'
  openOnHover?: boolean
  delay?: number
  closeDelay?: number
}

export interface NvPopoverTriggerProps {
  disabled?: boolean
  focusableWhenDisabled?: boolean
}

export interface NvPopoverContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}
