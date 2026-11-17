export type NvDataTableRow = Record<string, unknown>
export type NvDataTableAlign = 'left' | 'center' | 'right'
export type NvDataTableSortDirection = 'asc' | 'desc'
export type NvDataTableRowKey = string | number
export type NvDataTableSize = 'sm' | 'md'

export interface NvDataTableSort {
  /** Column key being sorted. */
  key: string
  direction: NvDataTableSortDirection
}

export interface NvDataTableColumn<T = NvDataTableRow> {
  /** Unique column key. Also names the `header-<key>` / `cell-<key>` slots. */
  key: string
  title: string
  align?: NvDataTableAlign
  /** CSS width for the column. */
  width?: string | number
  /** Enables the sort control for this column; falls back to the table's `sortable`. */
  sortable?: boolean
  /** Value used for sorting and the default cell. Defaults to `row[key]`. */
  value?: (row: T, index: number) => unknown
}

export interface NvDataTableProps<T = NvDataTableRow> {
  rows: T[]
  columns: NvDataTableColumn<T>[]
  /** Stable row identity. Defaults to the row's index. */
  rowKey?: keyof T | ((row: T, index: number) => NvDataTableRowKey)
  /** Controlled sort (`v-model:sort`). Pass `null` to sort nothing explicitly. */
  sort?: NvDataTableSort | null
  defaultSort?: NvDataTableSort | null
  /** Makes every column sortable unless the column opts out. */
  sortable?: boolean
  /** Adds a selection checkbox column. */
  selectable?: boolean
  /** Controlled selected row keys (`v-model:selected`). */
  selected?: NvDataTableRowKey[]
  defaultSelected?: NvDataTableRowKey[]
  /** Shown when `rows` is empty. The `empty` slot takes precedence. */
  emptyText?: string
  /** Screen-reader caption above the table. */
  caption?: string
  size?: NvDataTableSize
}
