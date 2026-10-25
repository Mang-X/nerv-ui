import type { LaneOrder, ScheduleModel, ScheduleResource, ScheduleTask } from './types'

export type LaneKpi = Pick<
  ScheduleResource,
  'utilization' | 'oee' | 'changeoverCount' | 'materialRisk'
>
export interface ResourceLane {
  key: string
  id?: string
  /** Explicit work-center membership; legacy resource IDs never imply this relation. */
  workCenterId?: string
  label: string
  resourceIds: string[]
  operations: ScheduleTask[]
  blocks: ScheduleTask[]
  kpi?: LaneKpi
}
export const resourceKey = (id: string) => JSON.stringify(['resource', id])
export const workCenterKey = (id: string) => JSON.stringify(['workCenter', id])
const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/** Per-input display projection, shared by both renderers. No domain registry or eligibility rules. */
export function resourceProjection(
  model: ScheduleModel,
  dimension = 'workCenter',
  order: LaneOrder = 'busiest',
) {
  const resources = new Map(model.resources.map((resource) => [resource.id, resource]))
  const catalog = model.groupValues?.[dimension]
  const explicit =
    catalog !== undefined ||
    model.tasks.some(
      (t) => t.dimensions?.[dimension] || (dimension === 'workCenter' && t.workCenterId),
    ) ||
    model.resources.some((r) => r.dimensions?.[dimension])
  const valueOf = (task: ScheduleTask) =>
    task.dimensions?.[dimension] ??
    resources.get(task.resourceId ?? '')?.dimensions?.[dimension] ??
    (dimension === 'workCenter' && task.workCenterId
      ? { id: task.workCenterId, label: task.workCenterId }
      : !explicit && task.resourceId
        ? { id: task.resourceId, label: resources.get(task.resourceId)?.text ?? task.resourceId }
        : undefined)
  const keyOf = (task: ScheduleTask) => JSON.stringify([dimension, valueOf(task)?.id ?? null])
  const lanes = new Map<string, ResourceLane>()
  function ensure(id: string | undefined, label: string) {
    const key = JSON.stringify([dimension, id ?? null])
    let lane = lanes.get(key)
    if (!lane) {
      lane = {
        key,
        id,
        label,
        workCenterId: explicit && dimension === 'workCenter' ? id : undefined,
        resourceIds: [],
        operations: [],
        blocks: [],
      }
      lanes.set(key, lane)
    }
    return lane
  }
  for (const value of catalog ?? []) ensure(value.id, value.label)
  for (const resource of model.resources) {
    const value =
      resource.dimensions?.[dimension] ??
      (!explicit ? { id: resource.id, label: resource.text } : undefined)
    if (value) ensure(value.id, value.label).resourceIds.push(resource.id)
  }
  for (const task of model.tasks) {
    if (!task.blockKind && (task.type !== 'operation' || task.isMilestone)) continue
    const value = valueOf(task)
    const lane = ensure(value?.id, value?.label ?? '未分配')
    if (task.resourceId && !lane.resourceIds.includes(task.resourceId))
      lane.resourceIds.push(task.resourceId)
    if (task.blockKind) lane.blocks.push(task)
    else lane.operations.push(task)
  }
  for (const lane of lanes.values()) {
    const ids = [...new Set(lane.resourceIds)]
    lane.resourceIds = ids
    // Non-additive resource facts are authoritative only for a single member.
    const resource = ids.length === 1 ? resources.get(ids[0]!) : undefined
    const kpi: LaneKpi = resource
      ? {
          utilization: resource.utilization,
          oee: resource.oee,
          changeoverCount: resource.changeoverCount,
          materialRisk: resource.materialRisk,
        }
      : {}
    if (
      !finite(kpi.utilization) &&
      ids.length &&
      ids.every((id) => model.loads.some((load) => load.resourceId === id))
    ) {
      const loads = model.loads.filter((load) => ids.includes(load.resourceId))
      if (
        loads.every(
          (load) =>
            finite(load.assignedMinutes) &&
            finite(load.availableMinutes) &&
            finite(load.utilization),
        )
      ) {
        const available = loads.reduce((sum, load) => sum + load.availableMinutes, 0)
        const assigned = loads.reduce((sum, load) => sum + load.assignedMinutes, 0)
        // Keep the supplied zero-capacity utilization; never divide by zero.
        kpi.utilization =
          available > 0 ? assigned / available : Math.max(...loads.map((load) => load.utilization))
      }
    }
    lane.kpi = kpi
  }
  const result = [...lanes.values()].filter(
    (lane) => order !== 'onlyScheduled' || lane.operations.length > 0,
  )
  const catalogOrder = new Map([...lanes.keys()].map((key, index) => [key, index]))
  result.sort((a, b) =>
    order === 'name'
      ? a.label.localeCompare(b.label, 'zh-Hans-CN') || a.key.localeCompare(b.key)
      : b.operations.length - a.operations.length ||
        catalogOrder.get(a.key)! - catalogOrder.get(b.key)!,
  )
  return { lanes: result, keyOf }
}
