export type TouchCardVariant = 'outline' | 'solid' | 'ghost'

export type TouchCardPadding = 'md' | 'lg'

export interface TouchCardProps {
  /** `outline` keeps a hairline border, `solid` sits on the raised surface color, `ghost` is transparent. */
  variant?: TouchCardVariant
  /** Heading shown in the built-in header. */
  title?: string
  /** Supporting line under the heading. */
  subtitle?: string
  /** Inner padding scale; `lg` is for full-screen station surfaces. */
  padding?: TouchCardPadding
  /** Makes the whole card pressable: focus ring plus pointer affordance. */
  interactive?: boolean
  /** Dims and blocks interaction when the card itself is disabled. */
  disabled?: boolean
}
