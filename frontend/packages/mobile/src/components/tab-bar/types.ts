import type { Component } from 'vue'

export interface MobileTabBarItem {
  value: string
  label: string
  icon?: Component
  badge?: string | number
  dot?: boolean
  disabled?: boolean
}
