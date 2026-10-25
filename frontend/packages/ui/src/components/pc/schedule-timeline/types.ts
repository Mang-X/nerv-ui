/** Actual instants must contain Z or an explicit numeric offset. Wall time is host-owned. */
export interface NvScheduleInterval {
  start: string
  end: string
}
export interface NvScheduleFact {
  label: string
  value: string
}
export interface NvScheduleTask extends NvScheduleInterval {
  id: string
  label: string
  groupId?: string
  resourceId?: string
  /** Explicit IANA zone or UTC; missing/invalid stays visibly unresolved. */
  timezone?: string | null
  facts?: readonly NvScheduleFact[]
  locked?: boolean
  conflictLabel?: string
  /** Host attention styling without implying a conflict action. */
  attentionLabel?: string
  /** Host-formatted risks; the renderer does not derive domain classifications. */
  statusLabels?: readonly string[]
  segments?: readonly (NvScheduleInterval & { id: string; label?: string })[]
}
export interface NvScheduleLane {
  id: string
  label: string
}
export interface NvScheduleLink {
  id: string
  source: string
  target: string
}
export interface NvScheduleWindow extends NvScheduleInterval {
  id: string
  laneId: string
  label: string
}
export interface NvScheduleVisualModel {
  horizon: NvScheduleInterval
  tasks: readonly NvScheduleTask[]
  links: readonly NvScheduleLink[]
  groups?: readonly NvScheduleLane[]
  resources?: readonly NvScheduleLane[]
  /** Axis labels only. Geometry always uses actual instants and UTC boundaries. */
  timezones?: readonly string[] | null
  /** Already determined by the host; never inferred from permission or calendar rules. */
  windows?: readonly NvScheduleWindow[]
}
