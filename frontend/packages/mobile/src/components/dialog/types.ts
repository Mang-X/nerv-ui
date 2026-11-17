export interface MobileDialogProps {
  /** Controlled visibility (`v-model:open`). Leave undefined for uncontrolled use. */
  open?: boolean
  /** Whether the dialog starts open when uncontrolled. */
  defaultOpen?: boolean
  title?: string
  description?: string
  /** Accessible name used when there is no title. */
  ariaLabel?: string
  modal?: boolean | 'trap-focus'
  dismissible?: boolean
  closeOnOutsidePress?: boolean
  /** Shows the top-right close button. */
  showClose?: boolean
  closeLabel?: string
  /** Renders a footer confirm button. */
  confirmText?: string
  /** Renders a footer cancel button. */
  cancelText?: string
  confirmLoading?: boolean
  confirmDisabled?: boolean
  /** Renders a built-in trigger button with this label. Omit to control `open` yourself. */
  triggerLabel?: string
}
