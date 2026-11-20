import type { Component } from 'vue'

export interface MobileFabProps {
  icon?: Component
  /** Accessible name; also shown as the visible label when `label` is set. */
  ariaLabel?: string
  label?: string
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'static'
  /** Width of the floating action button. `lg` shows a 56px round button. */
  size?: 'md' | 'lg'
  /** Distance from the bottom edge, raised above a tab bar by default. */
  offset?: number
  disabled?: boolean
}
