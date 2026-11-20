export type NvSeparatorOrientation = 'horizontal' | 'vertical'

export interface NvSeparatorProps {
  orientation?: NvSeparatorOrientation
  /** Hides it from assistive technology when the line is purely visual. */
  decorative?: boolean
}
