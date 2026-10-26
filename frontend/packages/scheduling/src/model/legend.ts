// 图例事实源:图例只讲图上真实出现过的语义。
// 每一项都由当前 ScheduleModel + 视图推导,而不是写死一张"全量色板"——
// 后端没带日历就不谈班次,方案里没有换型窗口就不列换型图例。

import { BLOCK_KINDS, type BlockKind } from './blocks'
import { resourceProjection, resourceKey, workCenterKey } from './resource-projection'
import {
  resolveTimeScale,
  orderDisplayScale,
  resourceDisplayScale,
  hasUnresolvedDisplayTimezone,
} from './scale'
import { hasInvalidModelTime } from './instant-validation'
import type { LaneOrder, ScheduleModel, TimeScale } from './types'

export interface SchedulingLegendSemantics {
  /** 甘特语义(工单甘特):计划基线 / 依赖箭头 / 里程碑。 */
  gantt: { baseline: boolean; link: boolean; milestone: boolean }
  /** 卡片(资源排产板):优先级 / 插单 / 齐套 / 换型耗时 / 瓶颈。 */
  card: {
    priority: boolean
    rush: boolean
    kitting: boolean
    changeover: boolean
    bottleneck: boolean
  }
  /**
   * 状态:冲突 / 锁定 / 物料风险。
   * 物料风险是软约束的产物(工序已排入,但开工前必须备料),图上以「缺料待备」chip 呈现,
   * 与「不可排」的冲突分开讲——所以图例也必须单列一项,不能混进冲突。
   */
  status: {
    conflict: boolean
    locked: boolean
    materialRisk: boolean
    /** 设备数据风险:排在状态未知设备上的工序(数据盲区,非阻断)。 */
    equipmentRisk: boolean
  }
  /** 阻塞:方案里真实出现过的资源时间块类型(按固定顺序)。 */
  blocks: BlockKind[]
  /**
   * 日历:仅有适用日历才推导非工作底纹;
   * 班次边界要输入日历且当前样式确实画出线才列（工单格点；资源零边框节点不列）；
   * 「现在」只在当下位于计划期与实际显示轴内时列出。
   */
  calendar: { nonWorking: boolean; shift: boolean; now: boolean }
}

const EMPTY: SchedulingLegendSemantics = {
  gantt: { baseline: false, link: false, milestone: false },
  card: { priority: false, rush: false, kitting: false, changeover: false, bottleneck: false },
  status: { conflict: false, locked: false, materialRisk: false, equipmentRisk: false },
  blocks: [],
  calendar: { nonWorking: false, shift: false, now: false },
}

/**
 * 「全部可能」的图例语义:只给没有模型可依据的场景用(组件库文档 / 演示挂载)。
 * 有模型时一律走 deriveLegendSemantics——消费方不许自己手写一份形状。
 */
export const FULL_LEGEND_SEMANTICS: SchedulingLegendSemantics = {
  gantt: { baseline: true, link: true, milestone: true },
  card: { priority: true, rush: true, kitting: true, changeover: true, bottleneck: true },
  status: { conflict: true, locked: true, materialRisk: true, equipmentRisk: true },
  blocks: [...BLOCK_KINDS],
  calendar: { nonWorking: true, shift: true, now: true },
}

/**
 * @param scale 当前图上的时间刻度。班次边界这类**随刻度出现/消失**的语义必须知道刻度才能如实推导;
 *   不传时按 `'auto'` 处理(与引擎同一套解析)。
 */
export function deriveLegendSemantics(
  model?: ScheduleModel,
  now: number = Date.now(),
  scale?: TimeScale,
  view: 'order' | 'resource' = 'order',
  grouping?: { groupBy?: string; laneOrder?: LaneOrder },
): SchedulingLegendSemantics {
  // These are diagram semantics. Explicit categories are a separate host palette
  // in SchedulingLegend and remain available without a resolved diagram.
  if (!model || hasUnresolvedDisplayTimezone(model) || hasInvalidModelTime(model)) return EMPTY
  const tasks = model.tasks ?? []
  const resolvedScale = resolveTimeScale(scale, model.horizon)
  const resourceDisplay =
    view === 'resource' ? resourceDisplayScale(model, resolvedScale) : undefined
  const display =
    resourceDisplay ?? (view === 'order' ? orderDisplayScale(model, resolvedScale) : undefined)
  if (!display) return EMPTY
  const { start: displayStart, end: displayEnd, cells } = display
  const backgroundEnd = resourceDisplay?.cellEnd ?? displayEnd
  const projection =
    view === 'resource'
      ? resourceProjection(
          model,
          grouping?.groupBy ?? model.groupDimensions?.[0]?.key ?? 'workCenter',
          grouping?.laneOrder,
        )
      : undefined
  const operations = projection
    ? projection.lanes
        .flatMap((lane) => lane.operations)
        .filter(
          (task) =>
            // Retained vendor admits boundary-touching and zero-duration tasks
            // (thin bars), unlike positive-area background intervals below.
            Date.parse(task.startUtc) <= displayEnd && Date.parse(task.endUtc) >= displayStart,
        )
    : tasks.filter((t) => t.type === 'operation' && !t.blockKind)
  // Resource rows are synthetic, without task flags. All task semantics use
  // the same P05 operations submitted to the renderer, never excluded summaries,
  // milestones or background blocks. Lane KPI has its own projection basis.
  const diagramTasks = projection ? operations : tasks.filter((t) => !t.blockKind)
  const renderedRows = projection
    ? projection.lanes.map((lane) => ({
        resources: lane.resourceIds,
        workCenter: lane.workCenterId,
      }))
    : tasks
        .filter((t) => !t.blockKind)
        .map((task) => ({
          resources: task.resourceId === undefined ? [] : [task.resourceId],
          workCenter: task.dimensions?.workCenter?.id ?? task.workCenterId,
        }))
  if (!renderedRows.length) return EMPTY
  const horizonStart = Date.parse(model.horizon?.startUtc ?? '')
  const horizonEnd = Date.parse(model.horizon?.endUtc ?? '')
  const indexed = new Map<string, { start: number; end: number }[]>()
  for (const calendar of model.calendars ?? []) {
    const windows = calendar.shiftWindows
      .map((window) => ({ start: Date.parse(window.startUtc), end: Date.parse(window.endUtc) }))
      .filter((window) => Number.isFinite(window.start) && window.end > window.start)
    for (const key of [
      ...calendar.resourceIds.map(resourceKey),
      ...calendar.workCenterIds.map(workCenterKey),
    ])
      indexed.set(key, [...(indexed.get(key) ?? []), ...windows])
  }
  // Same explicit namespace/precedence as the renderer; a resource name never becomes a work center.
  const rowWindows = renderedRows
    .map((row) => {
      const workCenter =
        row.workCenter === undefined ? undefined : indexed.get(workCenterKey(row.workCenter))
      if (workCenter !== undefined) return workCenter
      if (!row.resources.length || row.resources.some((id) => !indexed.has(resourceKey(id))))
        return undefined
      return row.resources.flatMap((id) => indexed.get(resourceKey(id))!)
    })
    .filter((windows): windows is { start: number; end: number }[] => windows !== undefined)
  // Resource shift fragments currently have zero width and a reset 0px border
  // under the supported stylesheet composition. A DOM node is not a painted
  // line. Keep CSS/engine untouched; only order's actual cell stroke is promised.
  const shiftBoundaryVisible =
    view === 'order' &&
    rowWindows.some((windows) => windows.some((window) => cells.includes(window.start)))
  const hasOffwork = rowWindows.some((windows) => {
    if (view === 'order')
      return cells.some((at) => !windows.some((window) => at >= window.start && at < window.end))
    let cursor = displayStart
    for (const window of [...windows].sort((a, b) => a.start - b.start)) {
      if (window.end <= cursor) continue
      if (window.start > cursor) return cursor < backgroundEnd
      cursor = Math.max(cursor, window.end)
    }
    return cursor < backgroundEnd
  })
  const visibleBlockKinds = new Set<BlockKind>()
  if (projection) {
    // Resource overlays draw every intersecting interval, including overlaps.
    for (const lane of projection.lanes)
      for (const block of lane.blocks)
        if (
          Date.parse(block.endUtc) > Date.parse(block.startUtc) &&
          Date.parse(block.startUtc) < backgroundEnd &&
          Date.parse(block.endUtc) > displayStart
        )
          visibleBlockKinds.add(block.blockKind!)
  } else {
    // Retained order cells choose the first matching interval in the first
    // matching lane: resource before work center, model order within each lane.
    const indexedBlocks = new Map<string, { start: number; end: number; kind: BlockKind }[]>()
    for (const block of tasks) {
      if (!block.blockKind) continue
      const start = Date.parse(block.startUtc)
      const end = Date.parse(block.endUtc)
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue
      for (const key of [
        ...(block.resourceId ? [resourceKey(block.resourceId)] : []),
        ...(block.workCenterId ? [workCenterKey(block.workCenterId)] : []),
      ]) {
        const windows = indexedBlocks.get(key) ?? []
        windows.push({ start, end, kind: block.blockKind })
        indexedBlocks.set(key, windows)
      }
    }
    for (const row of renderedRows) {
      const keys = [
        ...row.resources.filter(Boolean).map(resourceKey),
        ...(row.workCenter ? [workCenterKey(row.workCenter)] : []),
      ]
      for (const at of cells)
        for (const key of keys) {
          const hit = indexedBlocks
            .get(key)
            ?.find((window) => at >= window.start && at < window.end)
          if (hit) {
            visibleBlockKinds.add(hit.kind)
            break
          }
        }
    }
  }

  return {
    gantt: {
      baseline:
        view === 'order' &&
        operations.some(
          (t) =>
            Number.isFinite(Date.parse(t.plannedStartUtc ?? '')) &&
            Date.parse(t.plannedEndUtc ?? '') > Date.parse(t.plannedStartUtc ?? ''),
        ),
      link:
        view === 'order' &&
        (model.links ?? []).some(
          (link) =>
            diagramTasks.some((task) => task.id === link.source) &&
            diagramTasks.some((task) => task.id === link.target),
        ),
      milestone: view === 'order' && diagramTasks.some((t) => t.isMilestone || t.milestoneLabel),
    },
    card: {
      priority: operations.some((t) => !!t.priority),
      rush: operations.some((t) => t.isRush),
      kitting: operations.some((t) => typeof t.kitting === 'number'),
      changeover: operations.some(
        (t) => typeof t.changeoverMin === 'number' && t.changeoverMin > 0,
      ),
      bottleneck: projection
        ? projection.lanes.some(
            (lane) => Number.isFinite(lane.kpi?.utilization) && lane.kpi!.utilization! > 1,
          )
        : (model.resources ?? []).some((r) => (r.utilization ?? 0) > 1) ||
          (model.loads ?? []).some((l) => l.utilization > 1),
    },
    status: {
      conflict: diagramTasks.some((t) => t.hasConflict),
      locked: operations.some((t) => t.locked),
      // 有工序真的带物料风险才列;方案全齐套时图例里不出现「缺料待备」。
      materialRisk: operations.some((t) => !!t.materialRisk),
      // 同理:有工序真的排在状态未知设备上才列「设备状态未知」。
      equipmentRisk: operations.some((t) => !!t.equipmentRisk),
    },
    blocks: BLOCK_KINDS.filter((kind) => visibleBlockKinds.has(kind)),
    calendar: {
      // Absent calendars remain unknown; never invent night/weekend shading.
      nonWorking: hasOffwork,
      shift: shiftBoundaryVisible,
      now:
        Number.isFinite(horizonStart) &&
        Number.isFinite(horizonEnd) &&
        now >= horizonStart &&
        now <= horizonEnd &&
        displayStart !== undefined &&
        displayEnd !== undefined &&
        now >= displayStart &&
        now <= displayEnd,
    },
  }
}
