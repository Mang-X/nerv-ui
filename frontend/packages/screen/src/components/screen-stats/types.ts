export type ScreenStatTone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

export interface ScreenStatItem {
  key?: string | number
  label: string
  value: string | number
  unit?: string
  tone?: ScreenStatTone
  hint?: string
}

/** md = 30px value, lg = 38px value. */
export type ScreenStatsSize = 'md' | 'lg'
