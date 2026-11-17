import type { TreeController } from '@ui-sdk/vue/tree'

export type NvTreeMode = 'single' | 'multiple' | 'none'
export type NvTreeValue = string | string[] | null

export interface NvTreeItem {
  /** Unique value identifying the item. Also used for selection and expansion. */
  value: string
  /** Text shown on the row. */
  label: string
  children?: NvTreeItem[]
  disabled?: boolean
}

export interface NvTreeProps {
  /** The full hierarchy, including collapsed branches. */
  items: NvTreeItem[]
  /** How many items can be selected at once. */
  mode?: NvTreeMode
  /** Controlled selection (`v-model:value`). */
  value?: NvTreeValue
  defaultValue?: NvTreeValue
  /** Controlled expanded branches (`v-model:expanded`). */
  expanded?: string[]
  defaultExpanded?: string[]
  /** `automatic` selects while arrow keys move; `manual` waits for Enter or a press. */
  activation?: 'automatic' | 'manual'
  /** Whether pressing a branch row expands or collapses it. */
  expandOnPress?: boolean
  /** The value of the item representing the current page. */
  current?: string | null
  disabled?: boolean
  focusableWhenDisabled?: boolean
  keepMounted?: boolean
  hiddenUntilFound?: boolean
  controller?: TreeController
}
