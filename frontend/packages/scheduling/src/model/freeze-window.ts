import { scheduleInstant } from '@nerv-iip/ui/schedule-model'
import type { ScheduleFreezeContext } from './types'

/** Host-supplied stable interval; never computes freeze eligibility or a production calendar. */
export function freezeWindow(
  context: ScheduleFreezeContext | null | undefined,
  workCenterId: string,
) {
  const input = context?.windows.find((window) => window.workCenterId === workCenterId)
  if (!input) return undefined
  const { startUtc, endUtc } = input
  const start = scheduleInstant(startUtc)
  const end = scheduleInstant(endUtc)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return undefined
  return { startUtc, endUtc, start, end }
}

export function projectFreezeWindow(
  window: NonNullable<ReturnType<typeof freezeWindow>>,
  axisStart: number,
  axisEnd: number,
) {
  if (
    !Number.isFinite(axisStart) ||
    !Number.isFinite(axisEnd) ||
    axisEnd <= axisStart ||
    !Number.isFinite(window.start) ||
    !Number.isFinite(window.end) ||
    window.end <= window.start
  )
    return undefined
  const start = Math.max(window.start, axisStart)
  const end = Math.min(window.end, axisEnd)
  if (end <= start) return undefined
  return {
    ...window,
    left: ((start - axisStart) / (axisEnd - axisStart)) * 100,
    width: ((end - start) / (axisEnd - axisStart)) * 100,
  }
}
