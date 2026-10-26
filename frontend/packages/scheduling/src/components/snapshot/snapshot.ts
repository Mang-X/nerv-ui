/** Host-owned presentation facts. No inventory, availability or risk calculation. */
export type SnapshotDataState = 'available' | 'unknown' | 'missing' | 'forbidden' | 'unavailable'
export interface SnapshotSource {
  kind: 'snapshot' | 'current' | 'unknown'
  label: string
  /** Already formatted with an explicit timezone by the host. */
  capturedAt?: string | null
  /** Already translated host status; an empty record set never implies readiness. */
  status?: string | null
  state?: SnapshotDataState
}
export interface SnapshotActivity {
  id: string
  label: string
  location?: string
  time?: string
  result?: string
}
export interface SnapshotShortage {
  id: string
  label: string
  batch?: string | null
  quantity?: number | null
  unit?: string | null
  requiredQuantity?: number | null
  availableQuantity?: number | null
  affected?: readonly SnapshotActivity[] | null
}
export type SnapshotSeverity = 'info' | 'warning' | 'error' | 'unknown'
export interface SnapshotRisk {
  id: string
  category: { id: string; label: string }
  group: { id: string; label: string }
  label: string
  message: string
  severity?: SnapshotSeverity
  activity?: SnapshotActivity
  shortages?: readonly SnapshotShortage[] | null
  actionLabel?: string
  disabledReason?: string
}
export interface SnapshotConflict {
  id: string
  label: string
  message: string
  severity?: SnapshotSeverity
  reason: { id: string; label: string }
  activity?: SnapshotActivity
  actionLabel?: string
  disabledReason?: string
}
export interface SnapshotPending {
  id: string
  label: string
  message: string
  reasonLabel?: string
}
export interface SnapshotConflictsDisplay {
  conflicts: readonly SnapshotConflict[]
  unscheduled: readonly SnapshotPending[]
}
export interface SnapshotLoad {
  id: string
  resource: { id: string; label: string }
  start: string
  end: string
  assignedMinutes?: number | null
  availableMinutes?: number | null
  /** Host ratio, only formatted as a percentage; never calculated from minutes. */
  utilization?: number | null
}

// Structural compatibility with the four original app props. SDK imports are not required.
export interface LegacySnapshotShortage {
  id?: string
  materialId?: string | null
  materialLotId?: string | null
  shortageQuantity?: number | null
  requiredQuantity?: number | null
  availableQuantity?: number | null
  uomCode?: string | null
  affectedOperations?: readonly { orderId?: string | null; operationId?: string | null }[] | null
}
export interface LegacySnapshotRisk {
  id?: string
  orderId?: string | null
  operationId?: string | null
  resourceId?: string | null
  message?: string | null
  reasonCodes?: readonly string[]
  shortages?: readonly LegacySnapshotShortage[] | null
  materialReadyUtc?: string | null
}
export interface LegacySnapshotConflict {
  conflictId?: string | null
  orderId?: string | null
  operationId?: string | null
  resourceId?: string | null
  severity?: string | null
  reasonCode?: string | null
  message?: string | null
}
export interface LegacySnapshotLoad {
  resourceId?: string | null
  windowStartUtc?: string | null
  windowEndUtc?: string | null
  assignedMinutes?: number | null
  availableMinutes?: number | null
  utilization?: number | null
}

export function numberText(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '—'
}
export function percentageText(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value * 100)}%` : '—'
}
export const severityLabels = {
  info: '提示',
  warning: '预警',
  error: '阻断',
  unknown: '级别未知',
} as const
export const severityTones = {
  info: 'info',
  warning: 'warning',
  error: 'danger',
  unknown: 'neutral',
} as const
export function severity(value?: string | null): SnapshotSeverity {
  return value === 'info' || value === 'warning' || value === 'error' ? value : 'unknown'
}
/** Group by identity, never by visible text. Derivation does not mutate the input. */
export function groupRows<T>(rows: readonly T[], key: (row: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>()
  for (const row of rows) {
    const id = key(row)
    const group = groups.get(id)
    if (group) group.push(row)
    else groups.set(id, [row])
  }
  return [...groups]
}
/** Preserve the identifiers supplied by an older host without inventing a display name. */
export function legacyActivityLabel(
  orderId?: string | null,
  operationId?: string | null,
  resourceId?: string | null,
): string {
  return [orderId, operationId, resourceId].filter(Boolean).join(' · ') || '活动名称未提供'
}
export function legacyShortage(row: LegacySnapshotShortage): SnapshotShortage {
  return {
    id: row.id ?? JSON.stringify([row.materialId, row.materialLotId]),
    label: row.materialId ?? '物料名称未提供',
    batch: row.materialLotId,
    quantity: row.shortageQuantity,
    requiredQuantity: row.requiredQuantity,
    availableQuantity: row.availableQuantity,
    unit: row.uomCode,
    affected: row.affectedOperations?.map((item) => ({
      id: JSON.stringify([item.orderId, item.operationId]),
      label: legacyActivityLabel(item.orderId, item.operationId),
    })),
  }
}
