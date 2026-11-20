export type TouchAvatarSize = 'md' | 'lg' | 'xl'
export type TouchAvatarShape = 'circle' | 'square'

export interface TouchAvatarProps {
  /** Image source. The fallback shows while it loads, and if it fails. */
  src?: string
  /** Accessible name for the image. Also seeds the initials fallback. */
  alt?: string
  /** Person or team name, used for initials when `fallback` is not given. */
  name?: string
  /** Explicit fallback text. Takes precedence over the computed initials. */
  fallback?: string
  /** md = 56px, lg = 72px, xl = 96px. */
  size?: TouchAvatarSize
  shape?: TouchAvatarShape
  /** A small presence dot in the corner. */
  status?: 'online' | 'busy' | 'offline'
  /**
   * Milliseconds to wait before showing the fallback, so a fast image does not
   * flash initials first.
   */
  fallbackDelay?: number
}
