export type NvCardVariant = 'outline' | 'solid' | 'ghost'

export interface NvCardProps {
  /** `outline` keeps a hairline border, `solid` sits on the raised surface color, `ghost` is transparent. */
  variant?: NvCardVariant
}
