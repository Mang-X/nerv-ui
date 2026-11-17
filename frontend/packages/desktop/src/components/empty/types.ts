export type NvEmptySize = 'sm' | 'md'

export interface NvEmptyProps {
  /** Headline. The `title` slot takes precedence. */
  title?: string
  /** Supporting line. The `description` slot takes precedence. */
  description?: string
  size?: NvEmptySize
}
