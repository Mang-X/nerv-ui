import { scheduleInstant } from '@nerv-iip/ui/schedule-model'
import type { ScheduleModel, ScheduleTask } from '../../model/types'
import type {
  SnapshotConflictsDisplay,
  SnapshotRisk,
  SnapshotShortage,
  SnapshotSource,
} from '../snapshot/snapshot'

/** The host owns this key across revisions. Assignment/task IDs identify one snapshot only. */
export interface ScheduleSnapshotItem {
  semanticKey: string
  label: string
  groupLabel?: string
  task?: ScheduleTask
  state?: 'blocked' | 'unknown'
  message?: string
}

export interface ScheduleSnapshotMetric {
  id: string
  label: string
  value?: number | null
  format: 'number' | 'percent'
  unit?: string
}

export interface ScheduleSnapshot {
  id: string
  label: string
  source: SnapshotSource
  items: readonly ScheduleSnapshotItem[]
  /** Optional visual; it does not serve as a source for semantic matching. */
  model?: ScheduleModel
  metrics?: readonly ScheduleSnapshotMetric[]
  shortages?: readonly SnapshotShortage[]
  risks?: readonly SnapshotRisk[]
  conflicts?: SnapshotConflictsDisplay
}

export interface ScheduleComparisonRow {
  semanticKey: string
  before?: ScheduleSnapshotItem
  after?: ScheduleSnapshotItem
  kind: 'preserved' | 'changed' | 'added' | 'blocked' | 'missing'
}

function sameInstant(left: string, right: string) {
  return scheduleInstant(left) === scheduleInstant(right)
}

function sameAssignment(left: ScheduleTask, right: ScheduleTask) {
  const beforeSegments = left.segments ?? []
  const afterSegments = right.segments ?? []
  return (
    left.resourceId === right.resourceId &&
    sameInstant(left.startUtc, right.startUtc) &&
    sameInstant(left.endUtc, right.endUtc) &&
    beforeSegments.length === afterSegments.length &&
    beforeSegments.every(
      (segment, index) =>
        sameInstant(segment.startUtc, afterSegments[index]!.startUtc) &&
        sameInstant(segment.endUtc, afterSegments[index]!.endUtc),
    )
  )
}

/** Shared internal identity/time guard for both comparison and standalone preview. */
export function uniqueItems(snapshot: ScheduleSnapshot) {
  const items = new Map<string, ScheduleSnapshotItem>()
  const assignments = new Set<string>()
  for (const item of snapshot.items) {
    if (!item.semanticKey.trim() || items.has(item.semanticKey))
      throw new Error(`快照「${snapshot.label}」的活动身份缺失或重复，无法安全比较`)
    if (item.task) {
      if (assignments.has(item.task.id))
        throw new Error(`快照「${snapshot.label}」的安排实例身份重复，无法安全比较`)
      assignments.add(item.task.id)
      const instants = [
        item.task.startUtc,
        item.task.endUtc,
        ...(item.task.segments ?? []).flatMap((segment) => [segment.startUtc, segment.endUtc]),
      ]
      if (instants.some((instant) => !Number.isFinite(scheduleInstant(instant))))
        throw new Error(`快照「${snapshot.label}」的实际时刻无效，无法安全比较`)
    }
    items.set(item.semanticKey, item)
  }
  return items
}

/** Compare only assignment structure. No KPI, delay, readiness or APS result is inferred. */
export function compareScheduleSnapshots(
  baseline: ScheduleSnapshot,
  candidate: ScheduleSnapshot,
): ScheduleComparisonRow[] {
  const before = uniqueItems(baseline)
  const after = uniqueItems(candidate)
  const keys = [...before.keys(), ...[...after.keys()].filter((key) => !before.has(key))]
  return keys.map((semanticKey) => {
    const left = before.get(semanticKey)
    const right = after.get(semanticKey)
    let kind: ScheduleComparisonRow['kind']
    if (right?.state === 'blocked' && !right.task) kind = 'blocked'
    else if (!right?.task) kind = 'missing'
    else if (!left) kind = 'added'
    else if (!left.task) kind = 'changed'
    else kind = sameAssignment(left.task, right.task) ? 'preserved' : 'changed'
    return { semanticKey, before: left, after: right, kind }
  })
}
