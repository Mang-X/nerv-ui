export interface TouchToolbarItem {
  /** Identifies the action; reported by `@action`. */
  value: string
  label: string
  disabled?: boolean
  /** Marks the item as the current one for its group. */
  active?: boolean
}

export interface TouchToolbarProps {
  /** Actions to render, in order. */
  items: TouchToolbarItem[]
  /** Dims and blocks every action. */
  disabled?: boolean
  /** Where the bar sits: `fixed` pins it to the bottom of the viewport. */
  position?: 'static' | 'fixed'
  /** Lifts the bar above page content when `fixed`. */
  elevated?: boolean
  /** Accessible name for the bar. */
  ariaLabel?: string
}
