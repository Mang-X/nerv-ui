import { scheduleInstant } from '@nerv-iip/ui/schedule-model'
import type { ScheduleModel } from './types'

/** Every supplied actual instant, including an optional baseline, needs an offset. */
export function hasInvalidModelTime(model: ScheduleModel): boolean {
  const intervals = [
    model.horizon,
    ...model.tasks,
    ...model.tasks.flatMap((task) => task.segments ?? []),
  ]
  return (
    intervals.some(
      (interval) =>
        !Number.isFinite(scheduleInstant(interval.startUtc)) ||
        !Number.isFinite(scheduleInstant(interval.endUtc)),
    ) ||
    model.tasks.some((task) =>
      [task.plannedStartUtc, task.plannedEndUtc].some(
        (instant) => instant !== undefined && !Number.isFinite(scheduleInstant(instant)),
      ),
    )
  )
}
