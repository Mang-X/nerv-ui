export interface MobileDatePickerProps {
  /** Controlled visibility (`v-model:open`). Leave undefined for uncontrolled use. */
  open?: boolean
  defaultOpen?: boolean
  title?: string
  /** ISO date string, `YYYY-MM-DD`. `null` means no date yet. */
  modelValue?: string | null
  defaultValue?: string | null
  /** Earliest selectable date, `YYYY-MM-DD`. */
  min?: string
  /** Latest selectable date, `YYYY-MM-DD`. */
  max?: string
  /** Visible year range when `min`/`max` do not define one. */
  yearRange?: [number, number]
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  ariaLabel?: string
  modal?: boolean | 'trap-focus'
  dismissible?: boolean
  closeOnOutsidePress?: boolean
  /** Renders a built-in trigger button with this label. Omit to control `open` yourself. */
  triggerLabel?: string
}
