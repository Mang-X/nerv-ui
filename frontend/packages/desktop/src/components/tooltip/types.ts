export interface NvTooltipProps {
  /** Controlled open state (`v-model:open`). */
  open?: boolean
  defaultOpen?: boolean
  delay?: number
  closeDelay?: number
  disabled?: boolean
  /** `"label"` names the trigger; `"description"` describes it. */
  type?: 'label' | 'description'
}

export interface NvTooltipContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

export interface NvTooltipTriggerProps {
  disabled?: boolean
}
