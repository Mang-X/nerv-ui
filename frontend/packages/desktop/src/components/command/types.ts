export interface NvCommandItem {
  /** Identifies the command; reported by `@action`. */
  value: string
  /** The text the search matches and the row shows. */
  label: string
  /** More words the search matches. */
  keywords?: string[]
  disabled?: boolean
  /** Keys that run the command while the palette is mounted, like `"mod+p"`. */
  shortcut?: string
}

export interface NvCommandGroup {
  /** The group heading. */
  label?: string
  items: NvCommandItem[]
}

export type NvCommandEntry = NvCommandItem | NvCommandGroup

export interface NvCommandProps {
  /** Commands as data; groups render with their label. */
  items?: NvCommandEntry[]
  /** Controlled highlighted command (`v-model:value`). */
  value?: string | null
  defaultValue?: string | null
  /** Controlled search text (`v-model:query`). */
  query?: string
  defaultQuery?: string
  /** How typing narrows the list: `"fuzzy"` (default), `"contains"`, `"startsWith"` or `false`. */
  filter?: 'fuzzy' | 'contains' | 'startsWith' | false
  autoHighlight?: boolean
  loop?: boolean
  placeholder?: string
  /** Accessible name for the search field. */
  ariaLabel?: string
  emptyText?: string
}

export interface NvCommandEmits {
  /** Runs when a command is chosen, with its value. */
  action: (value: string) => void
}
