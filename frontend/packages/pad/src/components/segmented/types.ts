export interface SegmentedOption {
  value: string
  label: string
  disabled?: boolean
}

/** md = 56px, lg = 64px, xl = 72px item height. */
export type SegmentedSize = 'md' | 'lg' | 'xl'
