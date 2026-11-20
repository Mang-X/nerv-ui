import type { Component } from 'vue'

export interface MobileActionSheetItem {
  /** Identifies the action in the `select` event. */
  value: string
  label: string
  description?: string
  icon?: Component
  danger?: boolean
  disabled?: boolean
}

export interface MobileActionSheetProps {
  /** Controlled visibility (`v-model:open`). Leave undefined for uncontrolled use. */
  open?: boolean
  defaultOpen?: boolean
  title?: string
  description?: string
  actions?: MobileActionSheetItem[]
  cancelText?: string
  showCancel?: boolean
  ariaLabel?: string
  modal?: boolean | 'trap-focus'
  dismissible?: boolean
  closeOnOutsidePress?: boolean
}
