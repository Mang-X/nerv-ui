export interface TouchListItem {
  /** Identifies the row; reported by `v-model` and `@select`. */
  value: string
  title: string
  description?: string
  /** Short trailing text, like a count or a time. */
  meta?: string
  disabled?: boolean
}

export interface TouchListProps {
  items: TouchListItem[]
  /** Controlled selected value (`v-model`). `null` selects none. */
  modelValue?: string | null
  /** Value selected first when uncontrolled. */
  defaultValue?: string | null
  /** Heading shown above the rows. */
  label?: string
  /** Text shown when `items` is empty. */
  emptyLabel?: string
  /** Dims and blocks the whole list. */
  disabled?: boolean
}
