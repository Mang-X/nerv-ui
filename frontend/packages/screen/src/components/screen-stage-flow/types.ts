export type StageFlowTone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

export interface StageFlowStage {
  /** Stable identity; labels may repeat. */
  key: string | number
  label: string
  /** Host count; `null` means unknown, not zero. */
  value?: number | null
  unit?: string
  status?: { label: string; tone: StageFlowTone }
}
