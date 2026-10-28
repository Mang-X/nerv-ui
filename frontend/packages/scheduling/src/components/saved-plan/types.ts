/** All source rows are already projected by the host for one saved plan. */
export interface SavedPlanTaskRef {
  /** Assignment identity, never inferred from orderId/operationId. */
  taskId: string
  orderId: string
  operationId: string
}

export interface SavedPlanOrder {
  orderId: string
  label: string
  statusLabel?: string
  progress?:
    | { state: 'known'; completed: number; planned: number }
    | { state: 'unknown' | 'forbidden' | 'unavailable' }
  taskRefs: readonly SavedPlanTaskRef[]
}
export interface SavedPlanOrders {
  planId: string
  rows: readonly SavedPlanOrder[]
}

/** Group membership and labels are host facts, not a library domain join. */
export interface SavedPlanCommercialGroup {
  key: string
  label: string
  orderIds: readonly string[]
  target?: string
}
export type SavedPlanCommercial =
  | { planId: string; state: 'loading' | 'forbidden' | 'unavailable' }
  | { planId: string; state: 'ready'; groups: readonly SavedPlanCommercialGroup[] }

export interface SavedPlanLinks {
  planId: string
  items: readonly { orderId: string; target?: string }[]
}
export type SavedPlanNavigateRequest =
  | { kind: 'group'; planId: string; groupKey: string; target: string }
  | { kind: 'task'; planId: string; taskId: string; orderId: string; target: string }

export type SavedPlanNavigateBase =
  | { kind: 'group'; planId: string; groupKey: string }
  | { kind: 'task'; planId: string; taskId: string; orderId: string }
