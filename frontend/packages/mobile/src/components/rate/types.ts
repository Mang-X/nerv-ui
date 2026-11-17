export type MobileRateSize = 'sm' | 'md' | 'lg'

export interface MobileRateProps {
  /** Controlled score (`v-model`); `null` means no score yet. Leave undefined for uncontrolled use. */
  modelValue?: number | null
  defaultValue?: number | null
  max?: number
  /** Smallest change as a fraction of a star; `0.5` adds half stars. */
  step?: number
  deselectable?: boolean
  disabled?: boolean
  readonly?: boolean
  /** Renders the numeric score next to the stars. */
  showValue?: boolean
  ariaLabel?: string
  size?: MobileRateSize
}
