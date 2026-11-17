export type MobileAvatarSize = 'sm' | 'md' | 'lg' | 'xl'
export type MobileAvatarShape = 'circle' | 'square'

export interface MobileAvatarProps {
  /** Image source. The fallback shows while it loads, and if it fails. */
  src?: string
  alt?: string
  name?: string
  fallback?: string
  size?: MobileAvatarSize
  shape?: MobileAvatarShape
  /** Milliseconds to wait before showing the fallback. */
  fallbackDelay?: number
}
