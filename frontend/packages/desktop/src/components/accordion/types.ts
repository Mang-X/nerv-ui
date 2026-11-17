export interface NvAccordionProps {
  /** Controlled open item values (`v-model:value`). */
  value?: string[]
  defaultValue?: string[]
  /** Lets several items stay open at once. */
  multiple?: boolean
  /** Whether the one open item can close. */
  collapsible?: boolean
  disabled?: boolean
  keepMounted?: boolean
  hiddenUntilFound?: boolean
}

export interface NvAccordionItemProps {
  /** Unique value identifying the item. */
  value: string
  /** Trigger text. The `trigger` slot takes precedence. */
  title?: string
  disabled?: boolean
  /** Keeps this panel in the page while closed. */
  keepMounted?: boolean
}
