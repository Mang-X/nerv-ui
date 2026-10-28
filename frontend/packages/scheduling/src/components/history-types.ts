import type { ScheduleModel } from '../model/types'

/** Identity belongs to a source and revision, never just a reused plan ID. */
export interface SchedulingHistoryEntry {
  key: string
  label: string
  status: {
    key: string
    label: string
    tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  }
  createdAt: string
  timezone: string
  quantity: number | null
  model?: ScheduleModel
  confirmation?: { label: string; description: string; disabledReason?: string }
}
export interface SchedulingHistoryInput {
  source: string
  revision: string
  state: 'loading' | 'ready' | 'error'
  entries: readonly SchedulingHistoryEntry[]
}
export type SchedulingHistoryAction = (
  entry: SchedulingHistoryEntry,
  control: { signal: AbortSignal; source: string; revision: string },
) => Promise<boolean>
