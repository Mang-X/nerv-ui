export interface ScreenSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export type ScreenSelectSize = 'md' | 'lg'
export type ScreenSelectPresentation = 'popover' | 'sheet' | 'auto'
