import type { Component } from 'vue'

export interface MobileTabItem {
  value: string
  label: string
  icon?: Component
  disabled?: boolean
}
