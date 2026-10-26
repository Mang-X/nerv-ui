import type { ScheduleModel, ScheduleTask } from '../../model/types'
import type { SchedulingEditControl } from '../../composables/useSchedulingEdits'

/** Host owns identity, availability and restore semantics. */
export interface SchedulingDraftPendingItem {
  id: string
  taskId?: string
  label: string
  message?: string
  canRestore?: boolean
}
export type SchedulingDraftPatch = Partial<Pick<ScheduleTask, 'startUtc' | 'endUtc' | 'resourceId'>>
/** true is explicit success; false/throw retains the draft. No callback is unknown. */
export type SchedulingDraftAction = (
  snapshot: ScheduleModel,
  control: SchedulingEditControl,
) => Promise<boolean>
