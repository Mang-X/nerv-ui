export type NvNavigationMenuOrientation = 'horizontal' | 'vertical'

export interface NvNavigationMenuProps {
  /** Controlled open item value (`v-model:value`). `null` closes every panel. */
  value?: string | null
  defaultValue?: string | null
  /** Milliseconds the pointer rests before a panel opens. */
  delay?: number
  closeDelay?: number
  /** Whether resting the pointer on a trigger opens its panel. */
  openOnHover?: boolean
  closeOnSelect?: boolean
  orientation?: NvNavigationMenuOrientation
  /** Accessible name for the navigation landmark. */
  label?: string
}

export interface NvNavigationMenuItemProps {
  /** Identifies the item for the menu's value. Generated when omitted. */
  value?: string
}

export interface NvNavigationMenuTriggerProps {
  disabled?: boolean
}

export interface NvNavigationMenuContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  keepMounted?: boolean
}

export interface NvNavigationMenuLinkProps {
  href?: string
  /** Marks the link as the current page. */
  current?: boolean
  closeOnSelect?: boolean
}
