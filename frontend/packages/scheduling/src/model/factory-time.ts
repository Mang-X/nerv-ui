import type { ScheduleTimeContext } from './types'
import { scheduleInstant } from '@nerv-iip/ui/schedule-model'

/** 工厂墙上时间只在输入边界转换；草稿始终保存带偏移的实际时刻。 */
export function factoryTimeInput(instant: string, timezone: string): string {
  if (!timezone || !Number.isFinite(scheduleInstant(instant))) return ''
  try {
    const parts = new Intl.DateTimeFormat('sv-SE', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(instant))
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`
  } catch (error) {
    if (error instanceof RangeError) return ''
    throw error
  }
}

export function factoryTimeInstant(
  wall: string,
  timezone: string,
  original: string,
): string | undefined {
  const normalized = /^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(wall) ? `${wall}:00` : wall
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(normalized)) return undefined
  // 同值保留原始偏移/毫秒，也避免 DST 重叠区间的无操作保存被重新解释。
  if (timezone && normalized === factoryTimeInput(original, timezone)) return original
  const nominal = scheduleInstant(`${normalized}Z`)
  if (!Number.isFinite(nominal)) return undefined
  const candidates = new Set<number>()
  // 前后一天的偏移覆盖 DST 切换两侧；只有唯一可回显的实际时刻才接受。
  for (const delta of [-86400000, 0, 86400000]) {
    const probe = nominal + delta
    const displayed = factoryTimeInput(new Date(probe).toISOString(), timezone)
    if (!displayed) return undefined
    const offset = Date.parse(`${displayed}Z`) - probe
    const candidate = nominal - offset
    if (factoryTimeInput(new Date(candidate).toISOString(), timezone) === normalized)
      candidates.add(candidate)
  }
  const originalMillis = scheduleInstant(original)
  const milliseconds = Number.isFinite(originalMillis) ? ((originalMillis % 1000) + 1000) % 1000 : 0
  return candidates.size === 1
    ? new Date([...candidates][0] + milliseconds).toISOString()
    : undefined
}

/** Omitted, empty or invalid timezone stays unresolved; no browser fallback. */
export function scheduleTime(
  instant: string,
  timezone?: string,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!timezone || !factoryTimeInput('2000-01-01T00:00:00Z', timezone)) return '时区未解析'
  const millis = scheduleInstant(instant)
  if (!Number.isFinite(millis)) return '—'
  return new Date(millis).toLocaleString('zh-CN', {
    hourCycle: 'h23',
    ...options,
    timeZone: timezone,
  })
}

type TimeModel = { tasks: readonly { id: string; timezone?: string | null }[] }
type ProjectedTimeTask<M extends TimeModel> = Omit<
  M['tasks'][number],
  'timezone' | 'factoryTimeLabel'
> & { timezone: string; factoryTimeLabel: string }

/** Host supplies a separate zone per task; no first-factory/order inference. */
export function withFactoryTimeContext<M extends TimeModel>(
  model: M,
  context?: readonly ScheduleTimeContext[],
): Omit<M, 'tasks' | 'timezones'> & { tasks: ProjectedTimeTask<M>[]; timezones: string[] } {
  const byId = new Map(context?.map((item) => [item.taskId, item]))
  const tasks = model.tasks.map((task: M['tasks'][number]): ProjectedTimeTask<M> => {
    const item = byId.get(task.id)
    const timezone =
      item && !item.unresolvedReason && factoryTimeInput('2000-01-01T00:00:00Z', item.timezone)
        ? item.timezone
        : ''
    return {
      ...task,
      timezone,
      factoryTimeLabel: timezone
        ? (item!.label ?? timezone)
        : (item?.unresolvedReason ?? '时区未解析'),
    }
  })
  return { ...model, tasks, timezones: [...new Set(tasks.map((task) => task.timezone))].sort() }
}
