export interface MobileErrorRetryProps {
  title?: string
  description?: string
  /** Text of the retry button. */
  retryText?: string
  /** Disables the retry button while a retry is in flight. */
  loading?: boolean
  size?: 'sm' | 'md'
}
