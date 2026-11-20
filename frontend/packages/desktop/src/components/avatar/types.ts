export type NvAvatarSize = 'sm' | 'md' | 'lg' | 'xl'
export type NvAvatarShape = 'circle' | 'square'

export interface NvAvatarProps {
  /** Image source. The fallback shows while it loads, and if it fails. */
  src?: string
  /** Accessible name for the image. Also seeds the initials fallback. */
  alt?: string
  /** Person or team name, used for initials when `fallback` is not given. */
  name?: string
  /** Explicit fallback text. Takes precedence over the computed initials. */
  fallback?: string
  size?: NvAvatarSize
  shape?: NvAvatarShape
  /**
   * Milliseconds to wait before showing the fallback, so a fast image does not
   * flash initials first.
   */
  fallbackDelay?: number
}
