// 时间刻度的事实源:'auto' 解析成什么刻度、该刻度下单元格多粗,只有这一份答案。
// 引擎(画图)与图例(讲图)都从这里取——否则图例会承诺图面画不出来的东西。

import type { ScheduleModel, TimeScale } from './types'
import { factoryTimeInput, factoryTimeInstant } from './factory-time'

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

/** Display grid for the retained 9.1.4 order renderer (vendor Ri / scale_offset_minimal).
 * The range is task-driven, not horizon-driven. Resource overlays use intervals instead.
 * This helper never changes engine configuration or task dates.
 */
export function orderScaleCells(model: ScheduleModel, scale: ResolvedTimeScale): number[] {
  // Vendor getSubtaskDates excludes project summaries, whose input dates may be stale.
  const tasks = model.tasks.filter((task) => !task.blockKind && task.type !== 'order')
  const dates = tasks
    .flatMap((task) => [Date.parse(task.startUtc), Date.parse(task.endUtc)])
    .filter(Number.isFinite)
  if (!dates.length) return []
  const timezone = model.timezones?.at(-1)
  const step = scale === 'hour' ? 2 : scale === 'week' ? 7 : 1
  const wall = (at: number) =>
    timezone === undefined
      ? new Date(at)
      : new Date(`${factoryTimeInput(new Date(at).toISOString(), timezone)}Z`)
  const instant = (date: Date, original: number) =>
    timezone === undefined
      ? date.getTime()
      : Date.parse(
          factoryTimeInstant(
            date.toISOString().slice(0, 19),
            timezone,
            // factory_hour_start removes the fractional instant. The editing
            // helper deliberately preserves it, so normalize only this display
            // reference. Coarser retained factory units keep their offset phase.
            new Date(
              scale === 'hour' ? Math.floor(original / 1000) * 1000 : original,
            ).toISOString(),
          ) ?? '',
        )
  function start(at: number) {
    const date = wall(at)
    if (!Number.isFinite(+date)) return NaN
    if (timezone === undefined) {
      date.setMinutes(0, 0, 0)
      if (scale !== 'hour') date.setHours(0)
      if (scale === 'month') date.setDate(1)
    } else {
      date.setUTCMinutes(0, 0, 0)
      if (scale !== 'hour') date.setUTCHours(0)
      if (scale === 'month') date.setUTCDate(1)
    }
    return instant(date, at)
  }
  function add(at: number, count: number) {
    if (scale === 'hour') return at + count * 3_600_000
    const date = wall(at)
    if (timezone === undefined) {
      if (scale === 'month') date.setMonth(date.getMonth() + count)
      else date.setDate(date.getDate() + count)
    } else if (scale === 'month') date.setUTCMonth(date.getUTCMonth() + count)
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
  return cells
}
