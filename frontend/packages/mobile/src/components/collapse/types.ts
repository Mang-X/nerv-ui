import type { Component } from 'vue'

export interface MobileCollapseProps {
  /** Controlled open state (`v-model:open`). Leave undefined for uncontrolled use. */
  open?: boolean
  /** Whether the panel starts open when uncontrolled. */
  defaultOpen?: boolean
  title?: string
  description?: string
  disabled?: boolean
  /** Keeps the closed panel in the DOM, so exits can animate and find-in-page can open it. */
  keepMounted?: boolean
  icon?: Component
  ariaLabel?: string
}
