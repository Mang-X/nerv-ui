export interface NvRatingProps {
  /** Controlled score (`v-model:value`); `null` means no score yet. */
  value?: number | null
  defaultValue?: number | null
  /** How many stars. */
  max?: number
  /** The smallest change as a fraction of a star; `0.5` adds half stars. */
  step?: number
  /** Lets a press on the checked star clear the score. */
  deselectable?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** Name the score submits under. */
  name?: string
  form?: string
  /** Whether arrow keys wrap from the last star to the first. */
  loop?: boolean
  /** Accessible name for the rating group. */
  ariaLabel?: string
  /** Names a score for each star's radio. Defaults to `"<n> 星"`. */
  getValueLabel?: (value: number, max: number) => string
}
