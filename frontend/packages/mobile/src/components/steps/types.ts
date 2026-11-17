export type MobileStepsStatus = 'wait' | 'process' | 'active' | 'done' | 'error'

export interface MobileStepItem {
  title: string
  description?: string
  /** Steps never go backwards visually: a later item may omit it. */
  status?: MobileStepsStatus
}

export interface MobileStepsProps {
  items: MobileStepItem[]
  /** Controlled current step index (`v-model:current`). Leave undefined for uncontrolled use. */
  current?: number
  /** Starting index when uncontrolled. Defaults to 0. */
  defaultCurrent?: number
  direction?: 'horizontal' | 'vertical'
  /** Lets a press on a marker change the current step. */
  clickable?: boolean
  ariaLabel?: string
}
