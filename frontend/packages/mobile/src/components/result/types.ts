import type { Component } from 'vue'

export type MobileResultStatus = 'success' | 'error' | 'warning' | 'info'

export interface MobileResultProps {
  status?: MobileResultStatus
  title?: string
  description?: string
  icon?: Component
  actionText?: string
}
