export type ScreenTabsOrientation = 'horizontal' | 'vertical'

/** md = 18px label, lg = 20px label. */
export type ScreenTabsSize = 'md' | 'lg'

export interface ScreenTabItem {
  value: string
  label: string
  disabled?: boolean
  /** Short counter shown after the label, e.g. an item count. */
  badge?: string | number
}
