import type { AsyncOptionsContext } from '@ui-sdk/vue/async-options'
import type { ListFilter } from '@ui-sdk/vue/combobox'

export interface NvComboboxItem {
  /** Identifies the option and is what `v-model` reports. */
  value: string
  /** The text shown in the input and matched while filtering. */
  label: string
  /** More words filtering matches. */
  keywords?: string[]
  disabled?: boolean
}

export type NvComboboxValue = string | string[] | null
export type NvComboboxFilter = ListFilter<string>

/** Loads options for the current query; return the items, or a page with `hasMore`. */
export type NvComboboxLoader = (
  query: string,
  context: AsyncOptionsContext,
) => Promise<NvComboboxItem[] | { items: NvComboboxItem[]; hasMore?: boolean }>

export interface NvComboboxProps {
  /** Controlled value (`v-model:value`). An array when `multiple`. */
  value?: NvComboboxValue
  defaultValue?: NvComboboxValue
  multiple?: boolean
  /** With `multiple`, how many items can be selected. */
  maxSelected?: number
  /** Options as data. Labels resolve before the list ever opens. */
  items?: NvComboboxItem[]
  /**
   * Loads options as the query changes. When set, `items` is ignored, the loader
   * owns filtering and the wrapper keeps the query controlled.
   */
  loadOptions?: NvComboboxLoader
  /** Milliseconds typing pauses before `loadOptions` runs. Defaults to 200. */
  debounce?: number
  /** Runs `loadOptions` for the initial query on mount. Defaults to true. */
  loadOnMount?: boolean
  /** Controlled open state (`v-model:open`). */
  open?: boolean
  defaultOpen?: boolean
  /** Controlled query text (`v-model:query`). */
  query?: string
  defaultQuery?: string
  /** How typing narrows the list; `false` keeps every item. */
  filter?: NvComboboxFilter
  autoHighlight?: 'always' | boolean
  /** Lets text that matches no item become the value. */
  allowCustomValue?: boolean
  loop?: boolean
  placeholder?: string
  /** Accessible name for the search field. */
  ariaLabel?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Name the value submits under. */
  name?: string
  form?: string
  clearable?: boolean
  clearLabel?: string
  triggerLabel?: string
  emptyText?: string
  loadingText?: string
  /** Hides the built-in chevron trigger. */
  showTrigger?: boolean
}
