export interface NvSidebarProps {
  /** Controlled collapsed state (`v-model:collapsed`). */
  collapsed?: boolean
  /** Collapsed state at first, when uncontrolled. */
  defaultCollapsed?: boolean
  /** Shows the built-in collapse button and lets the rail narrow. */
  collapsible?: boolean
  width?: number | string
  collapsedWidth?: number | string
  /** Accessible name for the navigation landmark. */
  label?: string
}

export interface NvSidebarGroupProps {
  /** Small group heading. The `label` slot takes precedence. */
  label?: string
}

export interface NvSidebarItemProps {
  /** Marks the item as the current destination. */
  active?: boolean
  disabled?: boolean
  /** Renders the item as a link when given. */
  href?: string
  /** Item text. Also used as `aria-label` / `title` when the rail is collapsed. */
  label?: string
}
