export type MobilePickerValue = string | number

export interface MobilePickerOption {
  label: string
  value: MobilePickerValue
  disabled?: boolean
}

export interface MobilePickerColumn {
  /** Optional stable key for the column. */
  key?: string
  /** Names the column for assistive technology. */
  ariaLabel?: string
  options: MobilePickerOption[]
  /** Value used when the caller gives no model value for this column. */
  defaultValue?: MobilePickerValue
}

export interface MobilePickerProps {
  /** Controlled visibility (`v-model:open`). Leave undefined for uncontrolled use. */
  open?: boolean
  defaultOpen?: boolean
  title?: string
  description?: string
  columns?: MobilePickerColumn[]
  /** One value per column (`v-model`). */
  modelValue?: MobilePickerValue[] | null
  defaultValue?: MobilePickerValue[]
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
