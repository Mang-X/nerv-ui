export interface NvTabsProps {
  /** Controlled selected value (`v-model:value`). */
  value?: string | null
  defaultValue?: string | null
  orientation?: 'horizontal' | 'vertical'
  /** `"automatic"` selects on arrow focus; `"manual"` waits for Enter or Space. */
  activation?: 'automatic' | 'manual'
  loop?: boolean
}

export interface NvTabsTriggerProps {
  /** The value of the panel this tab shows. */
  value: string
  disabled?: boolean
}

export interface NvTabsPanelProps {
  /** The value of the tab that shows this panel. */
  value: string
  keepMounted?: boolean
}
