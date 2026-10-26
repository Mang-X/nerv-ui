// 时间刻度的事实源:'auto' 解析成什么刻度、该刻度下单元格多粗,只有这一份答案。
// 引擎(画图)与图例(讲图)都从这里取——否则图例会承诺图面画不出来的东西。

import type { ScheduleModel, TimeScale } from './types'
import { factoryTimeInput } from './factory-time'

export type ResolvedTimeScale = Exclude<TimeScale, 'auto'>

/**
 * 把 `'auto'` 解析成真实刻度:按计划期跨度决定。
 * 引擎 `DhtmlxEngine.resolveScale()` 直接调用本函数,图例也调用本函数,不许各算各的。
 */
export function resolveTimeScale(
  scale: TimeScale | undefined,
  horizon?: { startUtc?: string; endUtc?: string },
): ResolvedTimeScale {
  if (scale && scale !== 'auto') return scale
  if (!horizon?.startUtc || !horizon?.endUtc) return 'day'
  const days = (Date.parse(horizon.endUtc) - Date.parse(horizon.startUtc)) / 86_400_000
  if (!Number.isFinite(days)) return 'day'
  if (days <= 2) return 'hour'
  if (days <= 14) return 'day'
  if (days <= 90) return 'week'
  return 'month'
}

/**
 * 某个班次窗口的起点在当前刻度下**能不能真的画出一条班次边界竖线**。
 *
 * 引擎是逐格判定的:`timeline_cell_class` 拿到每个单元格的起点时间,只有它与某个班次窗口
 * 起点**完全相等**才加 `nerv-shift-start`(见 DhtmlxEngine)。所以能不能看见取决于当前刻度
 * 的单元格粒度:
 *
 * - **日 / 周 / 月级**:一格 ≥1 天,08:00 / 16:00 这类班次起点**不可能**等于格子起点 → 恒 0 条线。
 *   即便有零点起班的班次,那条线也与日边界完全重合,讲不出任何班次信息。**这一档是精确判定**,
 *   与时间轴起点无关——也正是走查台账 #41 抓到的那一档(日级图例列了班次边界,图面一条没有)。
 * - **班次级(hour)**:2 小时一格,**近似判定**。见下方"已知近似"。
 *
 * ## 已知近似(hour 档)
 *
 * 这里用「本地整点且小时数为偶数」判定格线。它成立的前提是 DHTMLX 的 2 小时格**从偶数整点起步**。
 * 而引擎从不设置 `config.start_date`,时间轴范围由任务时间推导后再按刻度对齐——**对齐到哪一档
 * 单位由 DHTMLX 内部决定,本仓库没有证据**。若某个方案的时间轴恰好起于奇数整点,格线就落在奇数
 * 小时上,本函数的判定会与图面相反。
 *
 * 历史研究时本机(macOS)无 DHTMLX 试用包(`@dhx/trial-gantt` 未安装,loader 别名到 stub、引擎契约测试 skip),
 * **实测未能进行**,故不把该分支写成"与引擎完全等价",只按"近似"对待并保留边界用例记录该假设。
 * P08 已在真实9.1.4确认奇数相位反例；当前图例使用下方 orderScaleCells，不再调用此近似。
 * 兼容方向(followup):让引擎把**实际生成的格线**回传给图例,或显式设置 `config.start_date`
 * 把相位钉死,届时本函数的 hour 分支可升级为精确判定。
 */
export function shiftBoundaryRendersAt(startUtc: string, scale: ResolvedTimeScale): boolean {
  if (scale !== 'hour') return false
  const at = new Date(startUtc)
  if (Number.isNaN(at.getTime())) return false
  // 引擎逐格回调拿到的是**本地时间**的单元格起点,所以这里也按本地时间分量判定。
  return (
    at.getMinutes() === 0 &&
    at.getSeconds() === 0 &&
    at.getMilliseconds() === 0 &&
    at.getHours() % 2 === 0
  )
}

/** Same explicit-timezone prerequisite as SchedulingCanvas; no browser fallback. */
export function hasUnresolvedDisplayTimezone(model: ScheduleModel): boolean {
  const valid = (zone?: string) => !!zone && !!factoryTimeInput('2000-01-01T00:00:00Z', zone)
  return (
    !model.timezones?.length ||
    model.timezones.some((zone) => !valid(zone)) ||
    model.tasks.some((task) => !valid(task.timezone))
  )
}

/** Display grid for the retained 9.1.4 order renderer (vendor Ri / scale_offset_minimal).
 * The range is task-driven, not horizon-driven. Resource overlays use intervals instead.
 * This helper never changes engine configuration or task dates.
 */
export function orderScaleCells(model: ScheduleModel, scale: ResolvedTimeScale): number[] {
  return orderDisplayScale(model, scale)?.cells ?? []
}

/** Range and cells share the retained vendor's task-driven display calculation. */
export function orderDisplayScale(
  model: ScheduleModel,
  scale: ResolvedTimeScale,
): { start: number; end: number; cells: number[] } | undefined {
  if (hasUnresolvedDisplayTimezone(model)) return undefined
  const rows = model.tasks.filter((task) => !task.blockKind)
  if (!rows.length) return undefined
  // toGanttTask gives milestones precedence over the order/project type.
  // Mixed diagrams exclude project dates; all-project Ri instead uses the
  // first project's start plus one duration_unit (configured as one hour).
  const tasks = rows.filter((task) => task.type !== 'order' || task.isMilestone)
  const dates = tasks.length
    ? tasks.flatMap((task) => [
        Date.parse(task.startUtc),
        Date.parse(task.isMilestone ? task.startUtc : task.endUtc),
      ])
    : [Date.parse(rows[0]!.startUtc), Date.parse(rows[0]!.startUtc) + 3_600_000]
  if (dates.some((at) => !Number.isFinite(at))) return undefined
  const timezone = model.timezones!.at(-1)!
  const step = scale === 'hour' ? 2 : scale === 'week' ? 7 : 1
  const wall = (at: number) =>
    new Date(`${factoryTimeInput(new Date(at).toISOString(), timezone)}Z`)
  // Match retained factoryUnit display arithmetic from a known instant. Editing
  // admission deliberately rejects ambiguous wall times and cannot align a grid.
  const instant = (date: Date, original: number) => {
    const nominal = date.getTime()
    const offsetAt = (at: number) => wall(at).getTime() - at
    const estimate = nominal - offsetAt(original)
    return nominal - offsetAt(estimate)
  }
  function start(at: number) {
    const date = wall(at)
    if (!Number.isFinite(+date)) return NaN
    // Preserve which occurrence of a repeated hour the input instant belongs to.
    if (scale === 'hour')
      return (
        at -
        date.getUTCMinutes() * 60_000 -
        new Date(at).getUTCSeconds() * 1000 -
        new Date(at).getUTCMilliseconds()
      )
    date.setUTCMinutes(0, 0, 0)
    date.setUTCHours(0)
    if (scale === 'month') date.setUTCDate(1)
    return instant(date, at)
  }
  function add(at: number, count: number) {
    if (scale === 'hour') return at + count * 3_600_000
    const date = wall(at)
    if (scale === 'month') date.setUTCMonth(date.getUTCMonth() + count)
    else date.setUTCDate(date.getUTCDate() + count)
    return instant(date, at)
  }
  const first = add(start(Math.min(...dates)), -step)
  const end = add(start(Math.max(...dates)), 2 * step)
  const cells: number[] = []
  for (let at = first; Number.isFinite(at) && at < end; ) {
    cells.push(at)
    const next = add(at, step)
    if (!(next > at)) break
    at = next
  }
  return { start: first, end, cells }
}
