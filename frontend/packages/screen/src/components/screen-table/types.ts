export type ScreenTableTone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

export type ScreenTableAlign = 'start' | 'center' | 'end'

export interface ScreenTableCell {
  value: string | number | null | undefined
  tone?: ScreenTableTone
  /** Show a status dot before the text. Defaults to true for `variant: 'status'`. */
  dot?: boolean
}

export type ScreenTableRowValue = string | number | null | undefined | ScreenTableCell

export interface ScreenTableRow {
  /** Row identity; `rowKey` defaults to `id`. */
  id?: string | number
  [key: string]: ScreenTableRowValue
}

export interface ScreenTableColumn {
  key: string
  label: string
  align?: ScreenTableAlign
  /** CSS width, e.g. `120px`, `18%` or `140`. */
  width?: number | string
  /**
   * `status` renders the cell with a tone dot and tinted text. A tone can still
   * be given on a `text` cell for numbers that need emphasis.
   */
  variant?: 'text' | 'status'
}
