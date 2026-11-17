import type { Component } from 'vue'

export interface MobileEmptyProps {
  title?: string
  description?: string
  icon?: Component
  /** Adds the dashed card frame. Set false for inline empties inside lists. */
  bordered?: boolean
  size?: 'sm' | 'md'
}
