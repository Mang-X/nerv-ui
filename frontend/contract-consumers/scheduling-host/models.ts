import type { ScheduleModel } from '@nerv-iip/scheduling/model'
// Fixed host records for two non-production domains; these are supplied values, no solver.
export function readingPlan(id = 'reading'): ScheduleModel {
  return {
    tasks: [
      {
        id: 'read',
        orderId: 'club',
        operationId: 'chapter',
        operationSequence: 1,
        type: 'operation',
        text: '共读',
        startUtc: '2026-10-25T08:00:00Z',
        endUtc: '2026-10-25T09:00:00Z',
        locked: false,
        hasConflict: false,
        conflictReason: null,
      },
    ],
    links: [],
    resources: [],
    loads: [],
    conflicts: [],
    unscheduled: [],
    changes: [],
    horizon: { startUtc: '2026-10-25T00:00:00Z', endUtc: '2026-10-26T00:00:00Z' },
    meta: { planId: id, status: 'preview', algorithmVersion: 'host-supplied' },
  }
}
export const walkingPlan = {
  ...readingPlan('walking'),
  tasks: [{ ...readingPlan().tasks[0]!, id: 'walk', text: '公园散步' }],
}
