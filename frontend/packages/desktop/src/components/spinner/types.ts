export type NvSpinnerSize = 'sm' | 'md' | 'lg'

export interface NvSpinnerProps {
  size?: NvSpinnerSize
  /** Accessible label announced while it spins. */
  label?: string
  /** Hides it from assistive technology when it is purely decorative. */
  decorative?: boolean
}
