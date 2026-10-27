import { scheduleInstant } from '@nerv-iip/ui/schedule-model'
import { factoryTimeInstant } from '../../model/factory-time'
import type { SchedulingDayEntry } from './types'

/** A calendar day in an explicit IANA zone. Its actual length may be 23 or 25 hours. */
export function dayWindow(date: string, timezone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(scheduleInstant(`${date}T00:00:00Z`)))
    return undefined
  const following = new Date(`${date}T00:00:00Z`)
  following.setUTCDate(following.getUTCDate() + 1)
  const next = following.toISOString().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(next)) return undefined
  const start = factoryTimeInstant(`${date}T00:00:00`, timezone, '')
  const end = factoryTimeInstant(`${next}T00:00:00`, timezone, '')
  if (!start || !end) return undefined
  const startMs = scheduleInstant(start)
  const endMs = scheduleInstant(end)
  return startMs < endMs ? { start: startMs, end: endMs } : undefined
}

export function entriesOnDay(
  entries: readonly SchedulingDayEntry[],
  date: string,
  timezone: string,
  groupId: string,
) {
  const window = dayWindow(date, timezone)
  if (!window) return undefined
  return entries
    .filter((entry) => {
      if (groupId !== 'all' && entry.groupId !== groupId) return false
      const start = scheduleInstant(entry.startUtc)
      const end = scheduleInstant(entry.endUtc)
      return (
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start < end &&
        start < window.end &&
        end > window.start
      )
    })
    .sort(
      (a, b) =>
        scheduleInstant(a.startUtc) - scheduleInstant(b.startUtc) ||
        a.semanticKey.localeCompare(b.semanticKey) ||
        a.assignmentId.localeCompare(b.assignmentId),
    )
}
