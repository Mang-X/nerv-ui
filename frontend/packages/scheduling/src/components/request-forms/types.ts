/** Host-supplied presentation only. Keys are stable within sourceKey. */
export interface SchedulingRequestItem {
  readonly key: string
  readonly label: string
  readonly detail?: string
  readonly searchTerms?: readonly string[]
  readonly dueDisplay?: string | null
  readonly urgencyDisplay?: string | null
  readonly priority?: number | null
  readonly isRush?: boolean
  readonly disabledReason?: string
}

export type SchedulingRequestSourceState = 'unready' | 'loading' | 'error' | 'ready'
export interface SchedulingPriorityDraft {
  readonly priority: number | null
  readonly isRush: boolean
}
export interface SchedulingHorizonInput {
  readonly mode: 'preset' | 'custom'
  readonly presetKey: string
  /** Wall-clock text from datetime-local; the host resolves timezone and DST. */
  readonly startLocal: string
  readonly endLocal: string
}
export interface SchedulingHorizonValidation {
  readonly valid: boolean
  readonly message: string
}
export interface SchedulingHorizonPreset {
  readonly key: string
  readonly label: string
}
export interface SchedulingSingleRequest {
  readonly sourceKey: string
  readonly contextKey: string
  readonly itemKey: string
  readonly mode: 'new' | 'insert'
  readonly horizon: Readonly<SchedulingHorizonInput>
  readonly planKey?: string
  readonly priority: number | null
  readonly isRush: boolean
}
export interface SchedulingRequestReceipt {
  readonly key: string
  readonly label: string
}
