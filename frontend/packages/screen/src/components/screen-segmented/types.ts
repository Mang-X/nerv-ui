export type ScreenSegmentedOrientation = 'horizontal' | 'vertical'

/** md = 44px track item, lg = 52px, xl = 60px. */
export type ScreenSegmentedSize = 'md' | 'lg' | 'xl'

export interface ScreenSegmentedOption {
  value: string
  label: string
  disabled?: boolean
}
