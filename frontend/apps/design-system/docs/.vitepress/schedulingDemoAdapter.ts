import type {
  ScheduleModel,
  ScheduleTask,
  ScheduleLink,
  ScheduleConflict,
  UnscheduledItem,
  PlanStatus,
} from '@nerv-iip/scheduling/model'

/** 文档宿主静态事实；不是 SDK DTO，不求解或推断业务。 */
export interface DemoPlan {
  generatedAtUtc: string
  ganttItems: never[]
  changeSummary: never[]
  planId: string
  status: PlanStatus
  algorithmVersion: string
  assignments: {
    assignmentId: string
    orderId: string
    operationId: string
    operationSequence: number
    resourceId: string
    workCenterId: string
    startUtc: string
    endUtc: string
    isLocked: boolean
  }[]
  resourceLoads: ScheduleModel['loads']
  conflicts: {
    conflictId: string
    reasonCode: ScheduleConflict['reason']
    severity: ScheduleConflict['severity']
    orderId: string
    operationId: string
    resourceId: string
    message: string
  }[]
  unscheduledOperations: {
    orderId: string
    operationId: string
    reasonCode: UnscheduledItem['reason']
    message: string
  }[]
}

/** 仅适配三份文档数据，保留原样例分组与顺序连接语义。 */
export function demoPlanModel(plan: DemoPlan): ScheduleModel {
  const operations: ScheduleTask[] = plan.assignments.map((a) => ({
    id: a.assignmentId,
    orderId: a.orderId,
    operationId: a.operationId,
    operationSequence: a.operationSequence,
    parentId: `order:${a.orderId}`,
    type: 'operation',
    text: a.operationId,
    resourceId: a.resourceId,
    workCenterId: a.workCenterId,
    executionResourceId: a.resourceId,
    dimensions: { workCenter: { id: a.workCenterId, label: a.workCenterId } },
    startUtc: a.startUtc,
    endUtc: a.endUtc,
    locked: a.isLocked,
    hasConflict: false,
    conflictReason: null,
  }))
  const orders: ScheduleTask[] = [...new Set(operations.map((t) => t.orderId))].map((orderId) => {
    const kids = operations.filter((t) => t.orderId === orderId)
    return {
      id: `order:${orderId}`,
      orderId,
      operationId: '',
      operationSequence: 0,
      type: 'order',
      text: orderId,
      startUtc: kids.map((t) => t.startUtc).sort()[0],
      endUtc: kids
        .map((t) => t.endUtc)
        .sort()
        .at(-1)!,
      locked: false,
      hasConflict: false,
      conflictReason: null,
    }
  })
  const links: ScheduleLink[] = []
  for (const target of operations) {
    const source = operations
      .filter((t) => t.orderId === target.orderId && t.operationSequence < target.operationSequence)
      .sort((a, b) => b.operationSequence - a.operationSequence)[0]
    target.predecessors = source ? [`${source.orderId} · ${source.operationId}`] : []
    if (source)
      links.push({
        id: `${source.id}->${target.id}`,
        source: source.id,
        target: target.id,
        type: 'finish_to_start',
      })
  }
  for (const task of operations) {
    task.successors = links
      .filter((l) => l.source === task.id)
      .map((l) => {
        const target = operations.find((t) => t.id === l.target)!
        return `${target.orderId} · ${target.operationId}`
      })
  }
  const conflicts = plan.conflicts.map((c) => ({
    id: c.conflictId,
    reason: c.reasonCode,
    severity: c.severity,
    orderId: c.orderId,
    operationId: c.operationId,
    resourceId: c.resourceId,
    message: c.message,
    taskId: operations.find((t) => t.orderId === c.orderId && t.operationId === c.operationId)?.id,
  }))
  for (const conflict of conflicts) {
    const task = operations.find((t) => t.id === conflict.taskId)
    if (task && !(conflict.reason === 'equipment' && conflict.severity === 'warning')) {
      task.hasConflict = true
      task.conflictReason = conflict.reason
    }
  }
  return {
    tasks: [...orders, ...operations],
    links,
    resources: [...new Set(operations.map((t) => t.resourceId!))].map((id) => ({ id, text: id })),
    loads: plan.resourceLoads.map((l) => ({ ...l })),
    conflicts,
    unscheduled: plan.unscheduledOperations.map((u) => ({
      orderId: u.orderId,
      operationId: u.operationId,
      reason: u.reasonCode,
      message: u.message,
    })),
    materialRisks: [],
    equipmentRisks: [],
    changes: [],
    groupDimensions: operations.length ? [{ key: 'workCenter', label: '工作中心' }] : [],
    horizon: {
      startUtc: operations.map((t) => t.startUtc).sort()[0] ?? '',
      endUtc:
        operations
          .map((t) => t.endUtc)
          .sort()
          .at(-1) ?? '',
    },
    meta: { planId: plan.planId, status: plan.status, algorithmVersion: plan.algorithmVersion },
  }
}
