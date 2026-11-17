export type NvToolbarOrientation = 'horizontal' | 'vertical'

export interface NvToolbarProps {
  orientation?: NvToolbarOrientation
  /** Whether arrow keys wrap from the last item to the first. */
  loop?: boolean
  disabled?: boolean
}
