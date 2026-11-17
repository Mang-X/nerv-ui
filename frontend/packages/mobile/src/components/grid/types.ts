import type { Component } from 'vue'

export interface MobileGridItem {
  value: string
  label: string
  icon?: Component
  description?: string
  badge?: string | number
  disabled?: boolean
}

export interface MobileGridProps {
  items: MobileGridItem[]
  /** Controlled selected value (`v-model`). Leave undefined for uncontrolled use. */
  modelValue?: string | null
  defaultValue?: string | null
  /** Columns in the grid. */
  columns?: 2 | 3 | 4 | 5
  bordered?: boolean
  ariaLabel?: string
}
