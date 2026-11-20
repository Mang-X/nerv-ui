export type NvSliderValue = number | number[]

export interface NvSliderProps {
  /** Controlled value (`v-model:value`): one number, or one per thumb for a range. */
  value?: NvSliderValue
  defaultValue?: NvSliderValue
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readOnly?: boolean
  orientation?: 'horizontal' | 'vertical'
  /** Renders the formatted value below the track. */
  showValue?: boolean
  /** Accessible name shared by the thumbs. */
  label?: string
}
