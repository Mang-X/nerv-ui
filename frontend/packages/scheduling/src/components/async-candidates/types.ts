import type { ScheduleSnapshot, ScheduleSnapshotMetric } from '../comparison/comparison'

/** Opaque host identities. A response belongs to one request in one context. */
export interface SchedulingAsyncJob {
  id: string
  contextKey: string
  requestKey: string
  status: 'created' | 'running' | 'failed' | 'completed' | 'stopped'
  input: { baselineId: string; targetKey: string; targetLabel: string; windowLabel?: string }
  result?: SchedulingAsyncResult
}

export interface SchedulingAsyncResult {
  jobId: string
  contextKey: string
  requestKey: string
  promise?: {
    state: 'known' | 'unknown' | 'unavailable'
    /** Host-formatted local/task-zone minute text, never raw UTC. */
    at?: string
    reasons?: readonly string[]
  }
  metrics?: readonly ScheduleSnapshotMetric[]
  orders?: readonly {
    id: string
    label: string
    impact: string
    beforeCompletion?: string | null
    afterCompletion?: string | null
    delayDays?: number | null
    baselineLate?: boolean | null
    candidateLate?: boolean | null
  }[]
  operations?: readonly SchedulingOperationImpact[]
  baseline?: ScheduleSnapshot
  candidate?: ScheduleSnapshot
}

export interface SchedulingOperationImpact {
  id: string
  label: string
  reasons?: readonly string[]
  paths?: readonly { id: string; steps: readonly string[] }[]
}

export interface SchedulingCandidateMetric {
  id: string
  label: string
  before?: number | null
  after?: number | null
  beforeDenominator?: number | null
  afterDenominator?: number | null
  delta?: number | null
  /** Host-formatted change, e.g. percentage points rather than relative percent. */
  deltaDisplay?: string
  format: 'number' | 'percent'
  unit?: string
}

export interface SchedulingMovement {
  id: string
  label: string
  before?: { resource?: string; start?: string; end?: string; segments?: readonly string[] } | null
  after?: { resource?: string; start?: string; end?: string; segments?: readonly string[] } | null
  reasons?: readonly string[]
  paths?: readonly { id: string; steps: readonly string[] }[]
  transfers?: readonly {
    id: string
    label: string
    setupMinutes?: number | null
    sources?: readonly string[]
  }[]
}

export interface SchedulingCandidate {
  id: string
  label: string
  disabledReason?: string
  metrics?: readonly SchedulingCandidateMetric[]
  locked?: {
    preserved?: number | null
    total?: number | null
    details?: readonly { id: string; label: string; preserved: boolean; message?: string }[]
  }
  movements?: readonly SchedulingMovement[]
  explanations?: readonly { id: string; label: string; message?: string }[]
  snapshot?: ScheduleSnapshot
}

export interface SchedulingCandidateSet {
  contextKey: string
  baselineId: string
  jobId: string
  requestKey: string
  candidates: readonly SchedulingCandidate[]
}

export interface SchedulingHistoryPlan {
  id: string
  label: string
  status: string
  assignmentCount?: number | null
}

export interface SchedulingDowntimeItem {
  id: string
  resourceLabel: string
  startedAt: string
  duration: string
  phase: 'no-etr' | 'expected' | 'expired' | 'recovered'
  expectedRestoreAt?: string | null
  recoveredAt?: string | null
  alternativesCount?: number | null
  affected?: readonly { id: string; label: string; message?: string }[]
}
